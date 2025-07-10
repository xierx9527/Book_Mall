package model

import (
    "time"
)

// Role 定义用户角色类型
type Role string

const (
	RoleUser    Role = "user"
	RoleManager Role = "manager"
)

// BaseUser 定义用户基础信息结构体
type BaseUser struct {
	Username  string    `json:"username" gorm:"not null"`  // 用户名非空
	Password  string    `json:"password" gorm:"not null"` // 密码非空
	Role      Role      `json:"role" gorm:"default:user"`
	CreatedAt time.Time `json:"-" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"-" gorm:"autoUpdateTime"`
}

// User 定义普通用户结构体
type User struct {
	ID    uint `json:"id" gorm:"primaryKey"`
	BaseUser
	Email string `json:"email"`
	Phone string `json:"phone" gorm:"not null"` // 手机号非空
}

// Manager 定义管理员结构体
type Manager struct {
	ID    uint `json:"id" gorm:"primaryKey"`
	BaseUser
	Phone string `json:"phone" gorm:"not null"` // 管理员手机号非空
}

// Profile 定义用户登录信息结构体（改为使用手机号登录）
type Profile struct {
	Phone    string `json:"phone" binding:"required"`    // 使用手机号登录
	Password string `json:"password" binding:"required"` // 密码必填
}