package service

import (
	"errors"
	"time"
	"github.com/dgrijalva/jwt-go"
	"gorm.io/gorm"
	"book_mall/backend/model"
)

// Claims 定义 JWT 的声明结构体
type Claims struct {
	Phone    string `json:"phone"`
	Username string `json:"username"`
	Role     string `json:"role"`
	UserID   uint   `json:"user_id"` // 添加 UserID 字段
	jwt.StandardClaims
}

// 定义 JWT 签名密钥，实际使用中建议从配置文件或环境变量中获取
const Secret = "your-secret-key"

// GenerateToken 生成 JWT Token
func GenerateToken(phone, username, role string, userID uint) (string, error) {
	claims := Claims{
		Phone:    phone,
		Username: username,
		Role:     role,
		UserID:   userID, 
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
			Issuer:    "book_mall",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(Secret))
}

// ParseToken 解析 token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(Secret), nil // 转换为字节切片
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}


// Login 处理用户登录逻辑
func (s *AuthService) Login(phone, password string) (string, error) {
	// 先检查是否是管理员
	var manager model.Manager
	if err := s.db.Where("phone = ?", phone).First(&manager).Error; err == nil {
		if manager.Password == password {
			return GenerateToken(manager.Phone, manager.Username, string(manager.Role), manager.ID)
		}
		return "", errors.New("管理员密码错误")
	}

	// 如果不是管理员，检查普通用户
	var user model.User
	if err := s.db.Where("phone = ?", phone).First(&user).Error; err == nil {
		if user.Password == password {
			return GenerateToken(user.Phone, user.Username, string(user.Role), user.ID)
		}
		return "", errors.New("用户密码错误")
	}

	return "", errors.New("用户不存在")
}


type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

// 用户信息获取业务方法
func (s *AuthService) GetUserProfile(phone string) (interface{}, error) {
    // 检查普通用户表
    var user model.User
    if err := s.db.Where("phone = ?", phone).First(&user).Error; err == nil {
        user.Password = "" // 隐藏敏感信息
        return user, nil
    }

    // 检查管理员表（可选）
    var manager model.Manager
    if err := s.db.Where("phone = ?", phone).First(&manager).Error; err == nil {
        manager.Password = "" // 隐藏敏感信息
        return manager, nil
    }

    return nil, errors.New("用户不存在")
}

func (s *AuthService) Register(phone, username, password string) error {
    // 检查手机号是否已注册
    var count int64
    if err := s.db.Model(&model.User{}).Where("phone = ?", phone).Count(&count).Error; err != nil {
        return err
    }
    if count > 0 {
        return errors.New("该手机号已注册")
    }

    user := model.User{
        BaseUser: model.BaseUser{
            Username: username,
            Password: password,
            Role:     model.RoleUser,
        },
        Phone: phone,
    }

    return s.db.Create(&user).Error
}