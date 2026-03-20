import pool from '../config/db.js';
import generateUUID from '../utils/generateToken.js';

class RoleService{
    async getAllRoles(){
        const [roles]=await pool.execute(`select r.*,count(distinct ur.user_id) as user_count,count (distinct rp.permission_id) as permission_count from roles r left join user_roles ur on r.id=ur.role_id left join role_permissions rp on r.id=rp.role_id
            group by r.id order by r.id`);
            return roles;
    }

    async getRoleById(roleId){
        const [roles]=await pool.execute(
            'select * from roles where id=?',[roleId]
        );

        if(roles.length===0) return null;

        const role=roles[0];

        const [permissions]=await pool.execute(`select p.* from permissions p join role_permissions rp on p.id=rp.permission_id where rp.role_id=? order by p.resource,p.action`,[roleId]);
        role.permissions=permissions;

        const[users]=await pool.execute(`select u.id,u.email,u.is_email_verified,u.created_at from users u join user_roles ur on u.id=ur.user_id where ur.role_id=?`,[roleId]);
        role.users=users;
        return role;
    }

    async createRole(name,description=null){
        const connection=await pool.getConnection();

        try{
           await connection.beginTransaction();
           const [existing]=await connection.execute('select id from roles where name=?',[name]);

           if(existing.length>0){
            throw new Error('Role already exists');
           }
           const [result]=await connection.execute('insert into roles(name,description) values (?,?)',[name,description]);

           await connection.commit();

           return{
            id:result.insertId,
            name,
            description
           };
        }
        catch (error){
           await connection.rollback();
           throw error;
        }
        finally{
            connection.release();
        }
    }

    async updateRole(roleId,updates){
        const connection=await pool.getConnection();
        try{
            await connection.beginTransaction();
            const {name,description}=updates;
            await connection.execute('Update roles set name=?,description=? where id=?',[name,description,roleId]);

            await connection.commit();

            return this.getRoleById(roleId);
        }
        catch(error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    //delete role
    async deleteRole(roleId){
        const connection=await pool.getConnection();

        try{
            await connection.beginTransaction();
            const [users]=await connection.execute('select count(*) as count from user_roles where role_id=?',[roleId]);
            if(users[0].count>0){
                throw new Error('Cannot delete role that is assigned to users');
            }
            await connection.execute('delete from role_permissions where role_id=?',[roleId]);
            const [result]=await connection.execute('Delete from roles where id=?',[roleId]);

            await connection.commit();

            return result.affectedRows>0;
        }
        catch(error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    async getAllPermissions(){
        const[permissions]=await pool.execute(`select * from permissions order by resource,action`);

        const grouped={};
        permissions.forEach(perm=>{
            if(!grouped[perm.resource]){
                grouped[perm.resource]=[];
            }
            grouped[perm.resource].push(perm);
        });
        return grouped;
    }
    async assignPermissions(roleId,permissionIds){
        const connection=await pool.getConnection();
        try{
           await connection.beginTransaction();
           await connection.execute('Delete from role_permissions where role_id=?',[roleId]);

           for(const permissionId of permissionIds){
            await connection.execute(
                'Insert into role_permissions(role_id,permission_id) values(?,?)',[roleId,permissionId]
            );
           }
           await connection.commit();

           return this.getRoleById(roleId);
        }
        catch(error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    async assignRoleToUser(userId,roleId){
        const connection=await pool.getConnection();
        try{
            await connection.beginTransaction();
            const[existing]=await connection.execute(
                'Select * from user_roles where user_id=? and role_id=?',[userId,roleId]
            );
            if(existing.length===0){
                await connection.execute(
                    'Insert into user_roles(user_id,role_id) values(?,?)',[userId,roleId]
                );
            }
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
 
    async removeRoleFromUser(userId,roleId){
        const connection=await pool.getConnection();

        try{
            await connection.beginTransaction();
            const[userRoles]=await connection.execute(
                'Select count(*) as count from user_roles where user_id=?',[userId]
            );

            if(userRoles[0].count<=1){
                throw new Error('User must have at least one role');
            }
            const[result]=await connection.execute('Delete from user_roles where user_id=? and role_id=?',[userId,roleId]);

            await connection.commit();
            return result.affectedRows>0;
        }
        catch (error){
           await connection.rollback();
           throw error;
        }
        finally{
            connection.release();
        }
    }

    async getUserRoles(userId){
        const[roles]=await pool.execute(`select r.* from roles r join user_roles ur on r.id=ur.role_id where ur.user_id=?`,[userId]);

        const[permissions]=await pool.execute(`select distinct p.* from permissions p join role_permissions rp on p.id=rp.permission_id join user_roles ur on rp.role_id=ur.role_id where ur.user_id=? order by p.resource,p.action`,[userId]);

        return{
            roles,permissions
        };
    }

    async userHasPermission(userId,permissionName){
        const[result]=await pool.execute(`select count(*) as has_permission from user_roles ur join role_permissions rp on ur.role_id=rp.role_id join permissions p on rp.permission_id=p.id where ur.user_id=? and p.name=?`,[userId,permissionName]);
        return result[0].has_permission>0;
    }

    async userHasAnyPermission(userId,permissionNames){
        if(permissionNames.length===0) return true;

        const placeholders=permissionNames.map(()=>'?').join(',');
        const[result]=await pool.execute(`select count(distinct p.name) as permission_count from user_roles ur join role_permissions rp on ur.role_id=rp.role_id join permissions p on rp.permission_id=p.id where ur.user_id=? and p.name in (${placeholders})`,[userId,...permissionNames]);
        return result[0].permission_count>0;
    }

    async getAllUserWithRoles(){
        const [users]=await pool.execute(`select u.id,u.email,u.is_email_verified,u.created_at,group_concat(distinct r.name) as role_names,
            group_concat(distinct r.id) as role_ids,us.total_size,us.file_count,us.max_size from users u left join user_roles ur on u.id=ur.user_id left join roles r on ur.role_id=r.id left join user_storage us on u.id=us.user_id group by u.id order by u.created_at desc`);

            return users.map(user=>({
                ...user,role_names:user.role_names ? user.role_names.split(','):[],
                role_ids:user.role_ids ? user.role_ids.split(',').map(Number) :[]
            }));
    }
}

export default new RoleService();