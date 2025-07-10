package middleware

import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"book_mall/backend/service" // 确保导入正确
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")
		if authHeader == "" {
			log.Println("Authorization header 为空")
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "Authorization header 不能为空",
			})
			c.Abort()
			return
		}
		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			log.Println("Authorization header 格式错误")
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "Authorization header格式必须是Bearer <token>",
			})
			c.Abort()
			return
		}
		tokenString := authHeader[7:]
		// 解析 Token 并获取 Claims（关键修改）
		claims, err := service.ParseToken(tokenString)
		if err != nil {
			log.Printf("无效token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":  401,
				"msg":   "无效token",
				"error": err.Error(),
			})
			c.Abort()
			return
		}
		// 将 UserID 存入上下文（关键）
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func AdminRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("role")
        if !exists || role != "manager" {
            c.JSON(http.StatusForbidden, gin.H{
                "code": 403,
                "msg":  "需要管理员权限",
            })
            c.Abort()
            return
        }
        c.Next()
    }
}