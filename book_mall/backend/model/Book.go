package model

import (
	"time"
)

type Book struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UpdatedAt   time.Time `json:"-" gorm:"autoUpdateTime"`
	Title       string    `json:"title" gorm:"size:255;not null"`
	Author      string    `json:"author" gorm:"size:100;not null"`
	Price       float64   `json:"price" gorm:"type:decimal(10,2);not null"`
	Stock       int       `json:"stock" gorm:"default:0"`
	Description string    `json:"description" gorm:"type:text"`
	CoverImage  string    `json:"cover_image" gorm:"type:varchar(255)"`
    // 新增：声明与评论的一对多关联（关键修改）
    Comments    []BookComment `json:"comments" gorm:"foreignKey:BookID"` // 外键为 BookComment.BookID
}

type BookComment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"type:datetime;default:now()"`
	BookID    uint      `json:"book_id" gorm:"index"` // 外键，关联 Book.ID
	UserID    uint      `json:"user_id" gorm:"index"`
	UserName  string    `json:"user_name" gorm:"size:100;not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
}

type BookOrder struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	CreatedAt  time.Time `json:"created_at" gorm:"type:datetime;default:now()"`
	UserID     uint      `json:"user_id" gorm:"index"`
	BookID     uint      `json:"book_id" gorm:"index"`
    Book   Book `json:"book" gorm:"foreignKey:BookID"` // 确保有这行关联定义
	Quantity   int       `json:"quantity" gorm:"not null"`
	TotalPrice float64   `json:"total_price" gorm:"type:decimal(10,2);not null"`
	Status     string    `json:"status" gorm:"type:varchar(20);default:'pending'"`
	Receiver   string    `json:"receiver" gorm:"size:100;not null"` // 收货人
	Address    string    `json:"address" gorm:"type:text;not null"` // 收货地址
}
