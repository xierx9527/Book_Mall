package data

import (
	"log"
	"os"
	"time"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"book_mall/backend/model" // 添加这行导入
)

var db *gorm.DB

func InitDB() {
	dsn := os.Getenv("MYSQL_DSN")
	if dsn == "" {
		dsn = "root:20041017@tcp(127.0.0.1:3306)/Book_Mall?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	maxAttempts := 5
	for i := 1; i <= maxAttempts; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("数据库连接尝试 %d/%d 失败: %v", i, maxAttempts, err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatal("无法连接数据库:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("获取数据库实例失败:", err)
	}
	
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := db.AutoMigrate(&model.Book{}, &model.BookComment{}, &model.User{}, &model.Manager{},&model.BookOrder{}); err != nil {
		log.Fatal("数据库迁移失败:", err)
	}
}

func GetDB() *gorm.DB {
	return db
}