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