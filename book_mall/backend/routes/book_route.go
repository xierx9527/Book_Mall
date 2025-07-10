package routes

import (
	"net/http"
	"strconv"
	"net/url" // 添加这行导入
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"  // 添加这行导入
	"book_mall/backend/service"
	"book_mall/backend/model"
)

type BookHandler struct {
	service *service.BookService
}

func NewBookHandler(db *gorm.DB) *BookHandler {
	return &BookHandler{
		service: service.NewBookService(db),
	}
}

func (h *BookHandler) CreateBook(c *gin.Context) {
	var book model.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.service.CreateBook(book)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *BookHandler) DeleteBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID格式"})
		return
	}

	if err := h.service.DeleteBook(uint(id)); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Book deleted"})
}

func (h *BookHandler) UpdateBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID格式"})
		return
	}

	var book model.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.service.UpdateBook(uint(id), book)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, updated)
}

// 修改GetBookByID函数，保持使用:id
func (h *BookHandler) GetBookByID(c *gin.Context) {
    idStr := c.Param("id") // 保持使用id
    id, err := strconv.ParseUint(idStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID格式"})
        return
    }

    book, err := h.service.GetBookByID(uint(id))
    if err != nil {
        h.handleError(c, err)
        return
    }
    c.JSON(http.StatusOK, book)
}

func (h *BookHandler) GetAllBooks(c *gin.Context) {
	books, err := h.service.GetAllBooks()
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, books)
}

func (h *BookHandler) handleError(c *gin.Context, err error) {
	switch err {
	case service.ErrBookNotFound:
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case service.ErrBookAlreadyExists:
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	case service.ErrCommentNotFound: // 新增这行
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}


func (h *BookHandler) AddComment(c *gin.Context) {
    // 从上下文获取用户信息（关键）
    userIDVal, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未认证"})
        return
    }
    userID := userIDVal.(uint)

    usernameVal, exists := c.Get("username")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未认证"})
        return
    }
    username := usernameVal.(string)

    // 解析书籍 ID
    bookIDStr := c.Param("bookId")
    bookID, err := strconv.ParseUint(bookIDStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效的图书ID格式"})
        return
    }

    // 从请求体获取评论内容
    var req struct {
        Content string `json:"content" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "请求体解析失败", "detail": err.Error()})
        return
    }

    // 调用服务层添加评论（传递用户信息）
    newComment, err := h.service.AddComment(uint(bookID), userID, username, req.Content)
    if err != nil {
        h.handleError(c, err)
        return
    }

    c.JSON(http.StatusCreated, newComment)
}

func (h *BookHandler) GetComments(c *gin.Context) {
    bookID, err := strconv.ParseUint(c.Param("bookId"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效的图书ID格式"})
        return
    }

    comments, err := h.service.GetCommentsByBookID(uint(bookID))
    if err != nil {
        h.handleError(c, err)
        return
    }

    c.JSON(http.StatusOK, comments)
}

func (h *BookHandler) DeleteComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("commentId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的书籍 ID 格式"})
		return
	}

	if err := h.service.DeleteComment(uint(commentID)); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "评论已删除"})
}

func (h *BookHandler) CreateOrder(c *gin.Context) {
	var order model.BookOrder
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解码中文参数
	if receiver, err := url.QueryUnescape(order.Receiver); err == nil {
		order.Receiver = receiver
	}
	if address, err := url.QueryUnescape(order.Address); err == nil {
		order.Address = address
	}

	created, err := h.service.CreateOrder(order)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *BookHandler) GetCurrentUserOrders(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未认证"})
        return
    }

    orders, err := h.service.GetOrdersByUserID(userID.(uint))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单失败"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "orders": orders,
    })
}

func (h *BookHandler) UpdateOrderStatus(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("orderID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}

	var status struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateOrderStatus(uint(orderID), status.Status); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "订单状态更新成功"})
}

func (h *BookHandler) DeleteOrder(c *gin.Context) {
    orderID, err := strconv.ParseUint(c.Param("orderId"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID格式"})
        return
    }

    if err := h.service.DeleteOrder(uint(orderID)); err != nil {
        h.handleError(c, err)
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "订单删除成功"})
}

func (h *BookHandler) GetAllOrders(c *gin.Context) {
    orders, err := h.service.GetAllOrders()
    if err != nil {
        h.handleError(c, err)
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "orders": orders,
    })
}
// 添加GetUserOrders方法
func (h *BookHandler) GetUserOrders(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("userID"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户ID"})
        return
    }

    orders, err := h.service.GetOrdersByUserID(uint(userID))
    if err != nil {
        h.handleError(c, err)
        return
    }
    c.JSON(http.StatusOK, orders)
}

func (h *BookHandler) GetAdminOrders(c *gin.Context) {
    // 验证管理员权限
    userRole, exists := c.Get("userRole")
    if !exists || userRole != "manager" {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权访问"})
        return
    }

    orders, err := h.service.GetAllOrders()
    if err != nil {
        h.handleError(c, err)
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "orders": orders, // 确保返回orders字段
    })
}
