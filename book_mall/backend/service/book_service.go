package service

import (
	"errors"
	"gorm.io/gorm"
	"book_mall/backend/model"
)

// 在错误定义部分添加
var (
    ErrBookNotFound      = errors.New("book not found")
    ErrBookAlreadyExists = errors.New("book already exists")
    ErrCommentNotFound   = errors.New("comment not found") // 新增这行
)

type BookService struct {
	db *gorm.DB
}

func NewBookService(db *gorm.DB) *BookService {
	return &BookService{db: db}
}
func (s *BookService) CreateBook(book model.Book) (model.Book, error) {
	var existing model.Book
	if err := s.db.Where("id = ?", book.ID).First(&existing).Error; err == nil {
		return model.Book{}, ErrBookAlreadyExists
	}

	if err := s.db.Create(&book).Error; err != nil {
		return model.Book{}, err
	}
	return book, nil
}

func (s *BookService) DeleteBook(id uint) error {
	var book model.Book
	if err := s.db.First(&book, id).Error; err != nil {
		return ErrBookNotFound
	}
	return s.db.Delete(&book).Error
}

func (s *BookService) UpdateBook(id uint, updated model.Book) (model.Book, error) {
	var book model.Book
	if err := s.db.First(&book, id).Error; err != nil {
		return model.Book{}, ErrBookNotFound
	}

	updated.ID = id
	if err := s.db.Save(&updated).Error; err != nil {
		return model.Book{}, err
	}
	return updated, nil
}

func (s *BookService) GetBookByID(id uint) (model.Book, error) {
	var book model.Book
	// 预加载评论（关键修改）
	if err := s.db.Preload("Comments").First(&book, id).Error; err != nil {
		return model.Book{}, ErrBookNotFound
	}
	return book, nil
}

func (s *BookService) GetAllBooks() ([]model.Book, error) {
	var books []model.Book
	if err := s.db.Find(&books).Error; err != nil {
		return nil, err
	}
	return books, nil
}

// 保留此版本（已正确接收 userID 和 username）
func (s *BookService) AddComment(bookID, userID uint, username, content string) (model.BookComment, error) {
    if bookID == 0 || userID == 0 || username == "" || content == "" {
        return model.BookComment{}, errors.New("必要参数缺失")
    }

    comment := model.BookComment{
        BookID:    bookID,
        UserID:    userID,
        UserName:  username,
        Content:   content,
    }

    if err := s.db.Create(&comment).Error; err != nil {
        return model.BookComment{}, err
    }
    return comment, nil
}

func (s *BookService) DeleteComment(commentID uint) error {
	var comment model.BookComment
	if err := s.db.First(&comment, commentID).Error; err != nil {
		return ErrCommentNotFound
	}
	return s.db.Delete(&comment).Error
}

func (s *BookService) GetCommentsByBookID(bookID uint) ([]model.BookComment, error) {
	var comments []model.BookComment
	if err := s.db.Where("book_id = ?", bookID).Find(&comments).Error; err != nil {
		return nil, err
	}
	return comments, nil
}

func (s *BookService) CreateOrder(order model.BookOrder) (*model.BookOrder, error) {
	if err := s.db.Create(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

// 确保GetOrdersByUserID方法已正确定义
func (s *BookService) GetOrdersByUserID(userID uint) ([]model.BookOrder, error) {
    var orders []model.BookOrder
    if err := s.db.Preload("Book").Where("user_id = ?", userID).Find(&orders).Error; err != nil {
        return nil, err
    }
    return orders, nil
}

func (s *BookService) GetAllOrders() ([]model.BookOrder, error) {
    var orders []model.BookOrder
    if err := s.db.Preload("Book").Find(&orders).Error; err != nil {
        return nil, err
    }
    return orders, nil
}

func (s *BookService) UpdateOrderStatus(orderID uint, status string) error {
	return s.db.Model(&model.BookOrder{}).Where("id = ?", orderID).Update("status", status).Error
}

func (s *BookService) DeleteOrder(orderID uint) error {
    return s.db.Delete(&model.BookOrder{}, orderID).Error
}