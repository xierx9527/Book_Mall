package model

import"time"

type Order struct {
    ID        uint `gorm:"primarykey"`
    CreatedAt time.Time
    UpdatedAt time.Time
	Username string
	BookID uint
	BookName string
	BookPrice float64
	BookNum int
	TotalPrice float64
}