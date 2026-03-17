import pool from '../config/db.js'
import bcrypt from 'bcryptjs';
import generateUUID from '../utils/generateToken.js';

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
}

export default new AuthService();