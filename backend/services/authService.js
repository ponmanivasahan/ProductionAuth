import pool from '../config/db.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js'
import generateUUID from '../utils/generateToken.js';
import crypto from 'crypto';
class AuthService{
    async register(email,password){
        const connection=await pool.getConnection();

        try{
            await connection.beginTransaction();
            const [existingUsers]=await connection.execute(
                'Select id from users where email=?',[email]
            );
            if(existingUsers.length>0){
                throw new Error('User already exists');
            }

            const saltRounds=parseInt(process.env.BCRYPT_ROUNDS);
            const passwordHash=await bcrypt.hash(password,saltRounds);

            const userId=generateUUID();
            await connection.execute(`Insert into users (id,email,password_hash,is_email_verified) values (?, ?, ?, ?)`,[userId,email,passwordHash,false])

            const [roleRows]=await connection.execute(
                'select id from roles where name= ?',['user']
            );

            if(roleRows.length>0){
                await connection.execute(
                    'Insert into user_roles (user_id, role_id) values (?,?)',
                    [userId,roleRows[0].id]
                )
            }

            await connection.execute(
                `Insert into user_storage (user_id,total_size,file_count,max_size) values (?,?,?,?)`,
                [userId,0,0,104857600]  //i am setting 100 MB default
            )
            await connection.commit();

            return {
                id:userId,email,
                is_email_verified:false
            }
        }
        catch (error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    async login(email,password){
        const [users]=await pool.execute(
            `select u.id, u.email,u.password_hash,u.is_email_verified,
            group_concat(r.name) as roles 
            from users u left join user_roles ur on u.id=ur.user_id 
            left join roles r on ur.role_id=r.id  where u.email=? 
            group by u.id`, [email]
        )
        if(users.length===0){
            throw new Error('Invalid credentials');
        }
        const user=users[0];

        const isValidPassword=await bcrypt.compare(password,user.password_hash);
        if(!isValidPassword){
            throw new Error('Invalid credentials')
        }

        const roles=user.roles ? user.roles.split(',') :['user'];

        return { id:user.id,
            email:user.email,
            is_email_verified:user.is_email_verified===1,
            roles
        }
    }

    async getuserById(userId){
        const [users]=await pool.execute(
            `select u.id,u.email,u.is_email_verified,u.created_at,
            group_concat(r.name) as roles ,
            us.total_size,us.file_count,us.max_size from users u 
            left join user_roles ur on u.id=ur.user_id
            left join roles r on ur.role_id=r.id
            left join user_storage us on u.id=us.user_id
            where u.id=?
            group by u.id`,
            [userId]
        )

        if(users.length===0){
            return null;
        }
        const user=users[0];
        return{
            id:user.id,
            email:user.email,
            is_email_verified:user.is_email_verified===1,
            roles:user.roles ?user.roles.split(',') :[],
            storage:{
                used:user.total_size || 0,
                files:user.file_count || 0,
                max:user.max_size || 104857600
            },
            created_at:user.created_at
        }
    }

    generateTokens(user){
        const accessToken=jwt.sign({
            userId:user.id,
            email:user.email,
            roles:user.roles,
            is_email_verified:true,
        },
        authConfig.jwt.accessSecret,
        {expiresIn:authConfig.jwt.accessExpiry}
    );

    const refreshToken=jwt.sign(
        {userId:user.id},
        authConfig.jwt.refreshSecret,
        {expiresIn:authConfig.jwt.refreshExpiry}
    );
    return {accessToken,refreshToken}
    }

    //save and refresh token to db
    async saveRefreshToken(userId,refreshToken){
        const expiresAt=new Date();
        expiresAt.setDate(expiresAt.getDate()+7); //7 days from now

        const tokenId=generateUUID();

        await pool.execute(
            `Insert Into refresh_tokens (id,user_id,token,expires_at,revoked) 
            values(?,?,?,?,?)`,
            [tokenId,userId,refreshToken,expiresAt,false]
        )
        return tokenId;
    }

    //verify refresh token functionality is here
    async verifyRefreshToken(refreshToken){
        try{
            //verify jwt
            const decoded=jwt.verify(refreshToken,authConfig.jwt.refreshSecret);

            const [tokens]=await pool.execute(
                'Select * from refresh_tokens where token=? and revoked=?',
                [refreshToken,false]
            );
            if(tokens.length===0){
                return null;
            }

            const tokenData=tokens[0];
            if(new Date(tokenData.expires_at)<new Date()){
                await this.revokeRefreshToken(refreshToken);
                return null;
            }
            return decoded;
        }
        catch (error){
            return null;
        }
    }
   //revoke refresh token
    async revokeRefreshToken(refreshToken){
        await pool.execute(
            'Update refresh_tokens set revoked=? where token=?',
            [true,refreshToken]
        );
    }
     //revoke all user refresh tokens
    async revokeAllUserTokens(userId){
     await pool.execute(
        'Update refresh_tokens set revoked=? where user_id=?',
        [true,userId]
     );
    }

    //Create session
    async createSession(userId,sessionData){
        const sessionId=generateUUID();
        const expiresAt=new Date();
        expiresAt.setDate(expiresAt.getDate()+7);  //7 days

        await pool.execute(
            `Insert into sessions (id,user_id,data,expires_at)
            values(?,?,?,?)`,
            [sessionId,userId,JSON.stringify(sessionData),expiresAt]
        )
        return sessionId;
    }
   //get session
    async getSession(sessionId){
      const [sessions]=await pool.execute(
        'Select * from sessions where id=? and expires_at>NOW()',
        [sessionId]
      )
      if(sessions.length===0){
        return null;
      }
      return{
        ...sessions[0],
        data:JSON.parse(sessions[0].data)
      }
    }

    async getUserSessions(userId){
        const [sessions]=await pool.execute(
            `Select id,data,expires_at from sessions
            where user_id=? and expires_at>NOW()
            order by expires_at desc`,
            [userId]
        );

        return sessions.map((session)=>{
            let parsedData=session.data;
            if(typeof parsedData==='string'){
                try{
                    parsedData=JSON.parse(parsedData);
                }
                catch{
                    parsedData={};
                }
            }

            return {
                id:session.id,
                data:parsedData || {},
                expires_at:session.expires_at
            };
        });
    }
   //delete session
    async deleteSession(sessionId){
        await pool.execute('Delete from sessions where id=?',[sessionId]);
    }

    async cleanExpiredSessions(){
        const[result]=await pool.execute('Delete from sessions where expires_at<NOW()');
        return result.affectedRows;
    }

    //clean expired refresh tokens
    async cleanExpiredTokens(){
        const [result]=await pool.execute(
            'Delete from refresh_tokens where expires_at<NOW() or revoked=?',
            [true]
        )
        return result.affectedRows;
    }

    generateRandomToken(){
        return crypto.randomBytes(32).toString('hex');
    }

    async createPasswordResetToken(email){
        const [users]=await pool.execute(
            'Select id from users where email=?',
            [email]
        );

        if(users.length===0){
            return null;
        }
        const userId=users[0].id;
        const token=this.generateRandomToken();
        const tokenId=generateUUID();

        const tokenHash=crypto.createHash('sha256').update(token).digest('hex');

        const expiresAt=new Date();
        expiresAt.setHours(expiresAt.getHours()+1);

        //i am deleting the exisitng tokens here for the this current user
        await pool.execute('Delete from password_reset_tokens where user_id=?',[userId]);

        //creating new token here
        await pool.execute(
            `Insert into password_reset_tokens(id,user_id,token,expires_at) values(?,?,?,?)`,
            [tokenId,userId,tokenHash,expiresAt]
        );
        return token;
    }

    async verifyPasswordResetToken(token){
        const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
        const [tokens]=await pool.execute(`Select prt.*,u.email from password_reset_tokens prt
            join users u on prt.user_id=u.id where prt.token=? and prt.expires_at>NOW()`,[tokenHash]);

            if(tokens.length===0){
                return null;
            }
            return tokens[0];
    }

    async resetPassword(token,newPassword){
        const connection=await pool.getConnection();

        try{
            await connection.beginTransaction();
            const tokenData=await this.verifyPasswordResetToken(token);
            if(!tokenData){
                throw new Error('Invalid or expired token');
            }

            const saltRounds=parseInt(process.env.BCRYPT_ROUNDS);
            const passwordHash=await bcrypt.hash(newPassword,saltRounds);

            await connection.execute('Update users set password_hash=?, updated_at=NOW() where id=?',[passwordHash,tokenData.user_id]);
            await connection.execute('Delete from password_reset_tokens where id=?',[tokenData.id]);
            
            await this.revokeAllUserTokens(tokenData.user_id);

            await connection.commit();
            return {userId:tokenData.user_id,email:tokenData.email};
        }
        catch(error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    async createEmailVerificationToken(userId){
        const token=this.generateRandomToken();
        const tokenId=generateUUID();
        const tokenHash=crypto.createHash('sha256').update(token).digest('hex');

        const expiresAt=new Date();
        expiresAt.setHours(expiresAt.getHours()+24);
        await pool.execute('Delete from email_verification_tokens where user_id=?',[userId]);

        await pool.execute(`Insert into email_verification_tokens(id,user_id,token,expires_at)values(?,?,?,?)`,[tokenId,userId,tokenHash,expiresAt]);

        return token;
    }

    async verifyEmail(token){
        const tokenHash=crypto.createHash('sha256').update(token).digest('hex');

        const connection=await pool.getConnection();

        try{
            await connection.beginTransaction();
            const [tokens]=await connection.execute(
                `select evt.*,u.email from email_verification_tokens evt join users u on evt.user_id=u.id where evt.token=? and evt.expires_at>NOW()`,[tokenHash]
            );

            if(tokens.length===0){
                throw new Error('Invalid or expired token');
            }
            const tokenData=tokens[0];
            await connection.execute('Update users set is_email_verified=?,updated_at=NOW() where id=?',[true,tokenData.user_id]);

            await connection.execute(
                'Delete from email_verification_tokens where id=?',[tokenData.id]
            );

            await connection.commit();

            return {userId:tokenData.user_id,email:tokenData.email};
        }
        catch(error){
           await connection.rollback();
           throw error;
        }
        finally{
            connection.release();
        }
    }

    async resendVerificationEmail(email){
        const [users]=await pool.execute(
            'Select id ,is_email_verified from users where email=?',[email]
        );

        if(users.length===0){
            return null;
        }
        const user=users[0];
        if(user.is_email_verified){
            throw new Error('Email already verified');
        }

        const token=await this.createEmailVerificationToken(user.id);
        return {userId:user.id,token};
    }

    async clearExpiredTokens(){
        const [resetResult]=await pool.execute(
            'Delete from password_reset_tokens where expires_at<NOW()'
        )

        const [verifyResult]=await pool.execute(
            'Delete from email_verification_tokens where expires_at<NOW()'
        );
        return{
            passwordReset:resetResult.affectedRows,
            emailVerification:verifyResult.affectedRows
        };
    }
}

export default new AuthService();