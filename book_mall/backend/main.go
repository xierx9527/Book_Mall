package main

import (
	"log"
	"book_mall/backend/routes"
	"book_mall/backend/data"  // 确保data包已正确定义InitDB函数
	"book_mall/backend/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	data.InitDB()
	db := data.GetDB()
	
	// 初始化路由处理器
	bookHandler := routes.NewBookHandler(db) // 直接传入db
	authHandler := routes.NewAuthHandler(db) // 直接传入db

	r := gin.Default()
	r.Static("/static", "./static")
	// CORS 中间件
	// 修改CORS中间件
	r.Use(func(c *gin.Context) {
	    origin := c.Request.Header.Get("Origin")
	    if origin == "http://localhost:5173" { // 替换为你的前端地址
	        c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
	    }
	    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	    c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
	    c.Writer.Header().Set("Access-Control-Allow-Credentials", "true") // 添加这行
	    if c.Request.Method == "OPTIONS" {
	        c.AbortWithStatus(204)
	        return
	    }
	    c.Next()
	})

	// 认证路由
	r.POST("/login", authHandler.AuthLoginHandler)
	r.POST("/register", authHandler.RegisterHandler)

	// 需要认证的路由组
	authGroup := r.Group("/")
	authGroup.Use(middleware.AuthMiddleware())
	{
		// 图书管理路由
		authGroup.POST("/admin/books", middleware.AdminRequired(), bookHandler.CreateBook)
		authGroup.DELETE("/admin/books/:id", middleware.AdminRequired(), bookHandler.DeleteBook)
		authGroup.PUT("/admin/books/:id", middleware.AdminRequired(), bookHandler.UpdateBook)
		
		// 评论路由
		authGroup.POST("/bookcomments/:bookId", bookHandler.AddComment)
		authGroup.DELETE("/comments/:commentId", bookHandler.DeleteComment)

		//订单路由
		authGroup.POST("/orders",bookHandler.CreateOrder)
		authGroup.GET("/orders", bookHandler.GetCurrentUserOrders) 
		authGroup.PUT("/orders/:orderID",middleware.AdminRequired(),bookHandler.UpdateOrderStatus)
		authGroup.DELETE("/orders/:orderId",middleware.AdminRequired(), bookHandler.DeleteOrder) 
		authGroup.GET("/admin/orders", middleware.AdminRequired(), bookHandler.GetAllOrders)

		// 用户路由
		authGroup.GET("/user/profile", authHandler.GetUserProfileHandler) 
	}

	// 公开路由
	r.GET("/books/:id", bookHandler.GetBookByID)
	r.GET("/books", bookHandler.GetAllBooks)
	r.GET("/bookcomments/:bookId", bookHandler.GetComments)

	if err := r.Run(":8080"); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}