# 🚀 Hướng dẫn Test API Quiz Game với Postman

## 📋 **Cài đặt và Import Collection**

### 1. **Tải Postman**
- Tải Postman từ: https://www.postman.com/downloads/
- Hoặc sử dụng Postman Web: https://web.postman.com/

### 2. **Import Collection**
1. Mở Postman
2. Click **"Import"** 
3. Chọn file `Quiz_Game_API.postman_collection.json`
4. Collection sẽ được import vào Postman

## 🔧 **Cấu hình Environment**

### 1. **Tạo Environment**
1. Click **"Environments"** → **"New"**
2. Đặt tên: `Quiz Game Local`
3. Thêm các variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `quizId` | `your-quiz-id-here` | `your-quiz-id-here` |
| `roomId` | `your-room-id-here` | `your-room-id-here` |
| `questionId` | `your-question-id-here` | `your-question-id-here` |

### 2. **Chọn Environment**
- Chọn environment `Quiz Game Local` từ dropdown

## 🎯 **Test API theo thứ tự**

### **Bước 1: Test Authentication APIs**

#### 1.1 **Register User**
```
POST {{baseUrl}}/api/auth/register
```
**Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "password123"
}
```

#### 1.2 **Login User**
```
POST {{baseUrl}}/api/auth/login
```
**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Lưu ý:** Sau khi login thành công, Postman sẽ tự động lưu cookies. Các API protected sẽ sử dụng cookies này.

### **Bước 2: Test User APIs**

#### 2.1 **Get User Data**
```
GET {{baseUrl}}/api/v1/user/data
```
*Yêu cầu authentication*

### **Bước 3: Test Quiz APIs**

#### 3.1 **Get All Quizzes**
```
GET {{baseUrl}}/api/v1/quiz/all
```
*Public API - không cần authentication*

#### 3.2 **Create Quiz**
```
POST {{baseUrl}}/api/v1/quiz/create
```
**Body:**
```json
{
  "title": "Sample Quiz",
  "description": "A sample quiz for testing",
  "questions": [
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "timeLimit": 30
    },
    {
      "question": "What is the capital of Vietnam?",
      "options": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue"],
      "correctAnswer": 0,
      "timeLimit": 30
    }
  ]
}
```
*Yêu cầu authentication*

**Lưu ý:** Sau khi tạo quiz thành công, copy `quizId` từ response và cập nhật variable `quizId` trong environment.

#### 3.3 **Get Quiz for Game**
```
GET {{baseUrl}}/api/v1/quiz/{{quizId}}/game
```
*Public API - không cần authentication*

#### 3.4 **Check Answer**
```
POST {{baseUrl}}/api/v1/quiz/{{quizId}}/check-answer
```
**Body:**
```json
{
  "questionId": "{{questionId}}",
  "selectedAnswer": "A"
}
```
*Public API - không cần authentication*

### **Bước 4: Test Room APIs**

#### 4.1 **Create Room**
```
POST {{baseUrl}}/api/v1/room/create
```
**Body:**
```json
{
  "quizId": "{{quizId}}",
  "maxPlayers": 10
}
```
*Yêu cầu authentication*

**Lưu ý:** Sau khi tạo room thành công, copy `roomId` từ response và cập nhật variable `roomId` trong environment.

#### 4.2 **Join Room**
```
POST {{baseUrl}}/api/v1/room/join
```
**Body:**
```json
{
  "pin": "123456"
}
```
*Yêu cầu authentication*

#### 4.3 **Get Room Status**
```
GET {{baseUrl}}/api/v1/room/{{roomId}}/status
```
*Public API - không cần authentication*

## 🔍 **Kiểm tra Response**

### **Response thành công thường có format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Data here
  }
}
```

### **Response lỗi thường có format:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "ErrorType"
}
```

## 🛠️ **Troubleshooting**

### **1. Server không chạy**
```bash
# Kiểm tra server có đang chạy không
curl http://localhost:3000
```

### **2. Authentication lỗi**
- Kiểm tra đã login thành công chưa
- Kiểm tra cookies có được lưu không
- Thử login lại

### **3. Variables không hoạt động**
- Kiểm tra đã chọn đúng environment chưa
- Kiểm tra tên variable có đúng không
- Refresh collection

### **4. CORS lỗi**
- Kiểm tra server có bật CORS không
- Kiểm tra origin có đúng không

## 📝 **Tips**

1. **Sử dụng Tests tab** để tự động lưu variables:
```javascript
// Sau khi login thành công
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userId", response.data.user._id);
}
```

2. **Sử dụng Pre-request Script** để tự động set headers:
```javascript
pm.request.headers.add({
    key: "Authorization",
    value: "Bearer " + pm.environment.get("token")
});
```

3. **Sử dụng Collection Variables** để chia sẻ data giữa các requests

## 🎮 **Test Flow Hoàn Chỉnh**

1. **Register** → **Login** → **Create Quiz** → **Create Room** → **Join Room**
2. **Get All Quizzes** → **Get Quiz for Game** → **Check Answer**
3. **Get User Data** → **Get Room Status**

Chúc bạn test API thành công! 🚀 