package routes

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"book_mall/backend/service"
	"book_mall/backend/model"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		service: service.NewAuthService(db),
	}
}

// 新增：用户信息获取接口
func (h *AuthHandler) GetUserProfileHandler(c *gin.Context) {
	// 从请求头获取JWT
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code": 401,
			"msg":  "请先登录",
		})
		return
	}

	// 解析Bearer token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "无效的认证头格式",
		})
		return
	}

	// 验证并解析token
	claims, err := service.ParseToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":  401,
			"msg":   "无效的token",
			"error": err.Error(),
		})
		return
	}

	// 调用服务层获取用户信息
	userProfile, err := h.service.GetUserProfile(claims.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":  500,
			"msg":   "获取用户信息失败",
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"msg":     "获取成功",
		"profile": userProfile,
	})
}

func (h *AuthHandler) AuthLoginHandler(c *gin.Context) {
    var loginData model.Profile
    if err := c.ShouldBindJSON(&loginData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "code":  400,
            "msg":   "请求参数错误",
            "error": err.Error(),
        })
        return
    }

    token, err := h.service.Login(loginData.Phone, loginData.Password)
    if err != nil {
        statusCode := http.StatusInternalServerError
        if err.Error() == "用户不存在" || err.Error() == "密码错误" || err.Error() == "管理员密码错误" {
            statusCode = http.StatusUnauthorized
        }
        c.JSON(statusCode, gin.H{
            "code":  statusCode,
            "msg":   "登录失败",
            "error": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "code":  200,
        "msg":   "登录成功",
        "token": token,
    })
}

func (h *AuthHandler) RegisterHandler(c *gin.Context) {
    var registerData struct {
        Phone    string `json:"phone" binding:"required"`
        Username string `json:"username" binding:"required"`
        Password string `json:"password" binding:"required"`
    }

    if err := c.ShouldBindJSON(&registerData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "code": 400,
            "msg": "请求参数错误",
            "error": err.Error(),
        })
        return
    }

    if err := h.service.Register(registerData.Phone, registerData.Username, registerData.Password); err != nil {
        statusCode := http.StatusInternalServerError
        if err.Error() == "该手机号已注册" {
            statusCode = http.StatusBadRequest
        }
        c.JSON(statusCode, gin.H{
            "code": statusCode,
            "msg": "注册失败",
            "error": err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "code": 201,
        "msg": "注册成功",
    })
}