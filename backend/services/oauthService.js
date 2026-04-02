import axios from'axios';
import qs from 'querystring';
import pool from '../config/db.js'
import oauthConfig from '../config/oauth.js';
import generateUUID from '../utils/generateToken.js';
import authService from './authService.js';
import roleService from './roleService.js';

class OAuthService{
  getGoogleAuthURL(){
    const params={
        client_id:oauthConfig.google.clientId,
        redirect_uri:oauthConfig.google.callbackURL,
        response_type:'code',
        scope:oauthConfig.google.scope.join(''),
        access_type:'offline',
        prompt:'consent'
    }
    return `${oauthConfig.google.authorizationURL}?${qs.stringify(params)}`;
  }
  getHackClubAuthURL(){
    const params={
      client_id:oauthConfig.hackclub.clientId,
      redirect_uri:oauthConfig.hackclub.callbackURL,
      response_type:'code',
      scope:oauthConfig.hackclub.scope.join(' ')
    }
    return `${oauthConfig.hackclub.authorizationURL}?${qs.stringify(params)}`;
  }

  async getGoogleTokens(code){
    try{
      const {data}=await axios.post(
        oauthConfig.google.tokenURL,
        qs.stringify({
          code,
          client_id:oauthConfig.google.clientId,
          client_secret:oauthConfig.google.clientSecret,
           redirect_uri:oauthConfig.google.callbackURL,
           grant_type:'authorization_code'
        }
      ),
      {headers:{
        'Content-Type':'application/x-www-form-urlencoded'
      }}
      )
      return data;
    }
    catch(error){
        console.error('Google token error:',error.response?.data || error.message);
        throw new Error('Failed to get Google tokens');
    }
  }

  async getGoogleUser(accessToken){
    try{
      const {data}=await axios.get(oauthConfig.google.uesrInfoURL,{
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      });
      return{
        provider:'google',
        provideUserId:data.sub,
        email:data.email,
        name:data.name,
        picture:data.picture,
        emailVerified:data.email_verified
      };
    }
    catch(error){
        console.error('Google user info error:',error.response?.data || error.message);
        throw new Error('Failed to get Google user info');
    }
  }

  async getHackClubTokens(code){
    try{
       const {data}=await axios.post(
        oauthConfig.hackclub.tokenURL,
        qs.stringify({
          code,
          client_id:oauthConfig.hackclub.clientId,
          client_secret:oauthConfig.hackclub.clientSecret,
          redirect_uri:oauthConfig.hackclub.callbackURL,
          grant_type:'authorized_code'
        }),
        {headers:{
          'Content-Type':'application/x-www-form-urlencoded'
        }}
       );
       return data;
    }
    catch(error){
          console.error('HackClub token error:',error.response?.data || error.message);
          throw new Error('Failed to get HackClub tokens');
    }
  }
  async getHackClubUser(accessToken){
    try{
      const {data}=await axios.get(oauthConfig.hackclub.userInfoURL,{
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      });
      return{
        provider:'hackclub',
        providerUserId:data.id,
        email:data.email,
        name:data.name,
        picture:data.avatar,
        emailVerified:true,
      };
    }
    catch(error){
        console.error('HackClub user info error:',error.response?.data || error.message);
        throw new Error('Failed to get HackClub user info');
    }
  }
   
  async findOrCreateUser(oauthUser){
    const connection=await pool.getConnection();

    try{
      await connection.beginTransaction();
      const [oauthAccounts]=await connection.execute(
        `Select oa.*, u.* from oauth_accounts oa join users u on oa.user_id=u.id where oa.provider=? and ao.provider_user_id=?`
        [oauthUser.provider,oauthUser.providerUserId]
      );
      if(oauthAccounts.length>0){
        await connection.execute(`Update oauth_accounts set access_token=?, refresh_token=?,updated_at=NOW() where provider=? and provider_user_id=?,[
           oauthUser.accessToken || null,
            oauthUser.refreshToken || null,
            oauthUser.provider,
            oauthUser.providerUserId
            ]`)
            await connection.commit();
            const user=await authService.getuserById(oauthAccounts[0].user_id);
            return {user,isNewUser:false};
      }
       const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [oauthUser.email]
      );

      let userId;
      if(existingUsers.length>0){
        userId=existingUsers[0].id;
      }
      else{
        userId=generateUUID();
        await connection.execute(`Insert into users (id,email,is_email_verified,created_at,updated_at) values(?, ?, ?, NOW(),NOW())`,
          [userId,oauthUser.email,oauthUser.emailVerified ? 1 :0]
        );

         const [roleRows] = await connection.execute(
          'SELECT id FROM roles WHERE name = ?',
          ['user']
        );

        if (roleRows.length > 0) {
          await connection.execute(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleRows[0].id]
          );
        }
        await connection.execute(
          `Insert Into user_storage (user_id,total_size,file_count,max_size) values(?,?,?,?)`,[userId,0,0,104857600]
        );
      }
      const oauthAccountId=generateUUID();
      await connection.execute(
        `Insert Into oauth_accounts(id,user_id,provider,provider_user_id,access_token,refresh_token,created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          oauthAccountId,
          userId,
          oauthUser.provider,
          oauthUser.providerUserId,
          oauthUser.accessToken || null,
          oauthUser.refreshToken || null
        ]
      )
      await connection.commit();
      const user=await authService.getuserById(userId);
      return {user,isNewUser:existingUsers.length===0};
    }
    catch(error){
       await connection.rollback();
       throw error;
    }
    finally{
      connection.release();
    }
  }
  async handleGoogleCallback(code){
    const tokens=await this.getGoogleTokens(code);
    const oauthUser=await this.getGoogleUser(tokens.access_token);
    oauthUser.accessToken=tokens.access_token;
    oauthUser.refreshToken=tokens.refreshToken;
    const {user,isNewUser}=await this.findOrCreateUser(oauthUser);
    return {user,isNewUser};
  }

  async handleHackClubCallback(code){
    const tokens=await this.getHackClubTokens(code);
    const oauthUser=await this.getHackClubUser(tokens.accessToken);

    oauthUser.accessToken=tokens.access_token;
    oauthUser.refreshToken=tokens.refresh_token;
    const {user,isNewUser}=await this.findOrCreateUser(oauthUser);
    return {user,isNewUser};
  }

  async getUserOAuthAccounts(userId){
    const [accounts]=await pool.execute(
      `Select provider, provider_user_id,created_at from oauth_accounts where user_id=? order by created_at desc`,[userId]
    );
    return accounts;
  }
  async disconnectOAuthAccount(userId,provider){
    const connection=await pool.getConnection();
    try{
        await connection.beginTransaction();
        const [user]=await connection.execute(
          'Select password_hash from users where id=?',[userId]
        );
        const [oauthCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM oauth_accounts WHERE user_id = ?',
        [userId]
        );
          if (!user[0].password_hash && oauthCount[0].count <= 1) {
        throw new Error('Cannot disconnect last authentication method');
       }
       await connection.execute(
        'Delete from oauth_accounts where user_id=? and provider=?',[userId,provider]
       );
       await connection.commit();
       return true;
    }
    catch(error){
        await connection.rollback();
        throw error;
    }
    finally{
      connection.release();
    }
  }
}
export default new OAuthService();