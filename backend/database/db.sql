create database image_cloudinary;

create table users(
    id char(36) primary key,
    email varchar(255) unique not null,
    password_hash text,
    is_email_verified boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create index idx_users_email on users(email);

create table roles(
    id int auto_increment primary key,
    name varchar(50) unique not null,
)
create table user_roles(
    user_id char(36),
    role_id int,
    primary key (user_id,role_id),
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (role_id)  references roles(id) on delete cascade
)

create table oauth_accounts(
    id char(36) primary key,
    user_id char(36),
    provider varchar(50),
    provider_user_id varchar(255),
    access_token text,
    refresh_token text,
    created_at timestamp default current_timestamp,
    unique(provider, provider_user_id),
    foreign key references users(id) on delete cascade
);

create table password_reset_tokens(
    id char(36) primary key,
    user_id char(36),
    token text not null,
    expires_at datetime not null,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id) on delete cascade
);

create table email_verification_tokens(
    id char(36) primary key,
    user_id char(36),
    token text not null,
    expires_at datetime not null,
    foreign key(user_id) references users(id) on delete cascade
)

create table sessions(
    id varchar(255) primary key,
    user_id char(36),
    data json,
    expires_at datetime not null,
    foreign key (user_id) references users(id) on delete cascade
)
create index idx_sessions_user on sessions(user_id);
create index idx_sessions_expiry on sessions(expires_at);

create table refresh_tokens(
    id char(36) primary key,
    user_id char(36),
    token text not null,
    expires_at datetime not null,
    revoked boolean default false,
    created_at timestamp default current_timestamp,
    foreign key (user_is) references users(id) on delete cascade
)

create index idx_refresh_user on refresh_tokens(user_id);

create table permissions(
    id int auto_increment primary key,
    name varchar(100) unique not null,
    resource varchar(50) not null,
    action varchar(50) not null,
    description text,
    created_at timestamp default current_timestamp
);

create table role_permissions(
    role_id int,
    permission_id int,
    created_at timestamp default current_timestamp,
    primary key(role_id,permission_id),
    foreign key(role_id) references roles(id) on delete cascade,
    foreign key (permission_id) references permissions(id) on delete cascade
);


INSERT INTO permissions (name, resource, action, description) VALUES
-- File permissions
('file:create', 'file', 'create', 'Can upload files'),
('file:read', 'file', 'read', 'Can view files'),
('file:update', 'file', 'update', 'Can update file metadata'),
('file:delete', 'file', 'delete', 'Can delete own files'),
('file:read:all', 'file', 'read:all', 'Can view all files'),
('file:delete:all', 'file', 'delete:all', 'Can delete any file'),

-- User permissions
('user:read', 'user', 'read', 'Can view own profile'),
('user:update', 'user', 'update', 'Can update own profile'),
('user:read:all', 'user', 'read:all', 'Can view all users'),
('user:update:all', 'user', 'update:all', 'Can update any user'),
('user:delete', 'user', 'delete', 'Can delete users'),

-- Role permissions
('role:create', 'role', 'create', 'Can create roles'),
('role:read', 'role', 'read', 'Can view roles'),
('role:update', 'role', 'update', 'Can update roles'),
('role:delete', 'role', 'delete', 'Can delete roles'),
('role:assign', 'role', 'assign', 'Can assign roles to users'),

-- PDF operation permissions
('pdf:merge', 'pdf', 'merge', 'Can merge PDFs'),
('pdf:split', 'pdf', 'split', 'Can split PDFs'),
('pdf:compress', 'pdf', 'compress', 'Can compress PDFs'),

-- Storage permissions
('storage:read', 'storage', 'read', 'Can view storage info'),
('storage:update', 'storage', 'update', 'Can update storage limits'),

-- Admin permissions
('admin:access', 'admin', 'access', 'Can access admin panel'),
('system:logs', 'system', 'logs', 'Can view system logs'),
('system:config', 'system', 'config', 'Can modify system configuration');

-- user role permissions i have kept this default this for all users
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'user'),
  id
FROM permissions 
WHERE name IN (
  'file:create', 'file:read', 'file:update', 'file:delete',
  'user:read', 'user:update',
  'pdf:merge', 'pdf:split',
  'storage:read'
);

--admin role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin'),
  id
FROM permissions;