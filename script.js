// 存储键名
const STORAGE_KEYS = {
    MESSAGES: 'chat_messages',
    USERS: 'chat_users',
    CURRENT_USER: 'chat_current_user',
    MESSAGES_EXPIRY_DAYS: 30
};

// DOM 元素
// 身份验证相关
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const currentUserEl = document.getElementById('current-user');

// 聊天相关
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const clearMessagesBtn = document.getElementById('clear-messages');
const messageCountEl = document.getElementById('message-count');

// 当前用户信息
let currentUser = null;

// 初始化
function init() {
    // 检查是否已登录
    checkLoginStatus();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 检查登录状态
function checkLoginStatus() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showChatInterface();
        } catch (error) {
            console.error('解析用户信息失败:', error);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    } else {
        showAuthInterface();
    }
}

// 显示聊天界面
function showChatInterface() {
    authContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    
    if (currentUser) {
        currentUserEl.textContent = currentUser.name;
        addSystemMessage(`欢迎回来，${currentUser.name}！`);
    }
    
    // 加载聊天记录
    loadMessages();
    // 检查过期消息
    checkAndCleanupExpiredMessages();
}

// 显示身份验证界面
function showAuthInterface() {
    authContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    clearChatMessages();
}

// 切换到注册表单
function showRegisterForm() {
    clearErrorMessages();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerNameInput.focus();
}

// 切换到登录表单
function showLoginForm() {
    clearErrorMessages();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginEmailInput.focus();
}

// 用户注册
function registerUser() {
    clearErrorMessages();
    
    // 获取表单数据
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    
    // 验证表单
    if (!name || !email || !password) {
        showError('请填写所有必填字段');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('请输入有效的邮箱地址');
        return;
    }
    
    if (password.length < 6) {
        showError('密码长度至少为6位');
        return;
    }
    
    // 获取现有用户数据
    const users = getUsers();
    
    // 检查邮箱是否已存在
    if (users.some(user => user.email === email)) {
        showError('该邮箱已被注册');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashPassword(password), // 简单加密密码
        createdAt: new Date().toISOString()
    };
    
    // 保存用户数据
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // 自动登录新用户
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    // 显示聊天界面
    showChatInterface();
    
    // 重置表单
    registerNameInput.value = '';
    registerEmailInput.value = '';
    registerPasswordInput.value = '';
}

// 用户登录
function loginUser() {
    clearErrorMessages();
    
    // 获取表单数据
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    
    // 验证表单
    if (!email || !password) {
        showError('请填写所有必填字段');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('请输入有效的邮箱地址');
        return;
    }
    
    // 获取用户数据
    const users = getUsers();
    
    // 查找用户
    const user = users.find(user => user.email === email);
    
    // 验证用户和密码
    if (!user || user.password !== hashPassword(password)) {
        showError('邮箱或密码错误');
        return;
    }
    
    // 设置当前用户
    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    // 显示聊天界面
    showChatInterface();
    
    // 重置表单
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
}

// 用户登出
function logoutUser() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        currentUser = null;
        showAuthInterface();
    }
}

// 获取所有用户
function getUsers() {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersData ? JSON.parse(usersData) : [];
}

// 简单的密码加密函数
function hashPassword(password) {
    // 注意：这只是一个简单的演示用加密，实际应用中应使用更安全的加密方法
    return btoa(password + 'secure-salt');
}

// 验证邮箱格式
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 显示错误消息
function showError(message) {
    // 检查是否已有错误消息元素
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        // 将错误消息添加到表单上方
        const activeForm = loginForm.style.display !== 'none' ? loginForm : registerForm;
        activeForm.parentNode.insertBefore(errorElement, activeForm);
    }
    
    errorElement.textContent = message;
}

// 清除错误消息
function clearErrorMessages() {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// 以下是聊天功能相关的函数

// 检查并清理过期消息
function checkAndCleanupExpiredMessages() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (!storedData) return;
        
        const { messages, timestamp } = JSON.parse(storedData);
        const now = new Date().getTime();
        const expiryTime = STORAGE_KEYS.MESSAGES_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        // 如果超过30天，删除所有消息
        if (now - timestamp > expiryTime) {
            localStorage.removeItem(STORAGE_KEYS.MESSAGES);
            console.log('聊天记录已超过30天，已自动清除');
            addSystemMessage('聊天记录已超过30天，已自动清除');
        }
    } catch (error) {
        console.error('检查过期消息时出错:', error);
    }
}

// 加载历史消息
function loadMessages() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (!storedData) return;
        
        const { messages } = JSON.parse(storedData);
        messages.forEach(msg => {
            addMessageToDOM(msg.userId, msg.userName, msg.content, msg.time, msg.isUser);
        });
        
        updateMessageCount();
        scrollToBottom();
    } catch (error) {
        console.error('加载消息时出错:', error);
    }
}

// 保存消息到本地存储
function saveMessages() {
    try {
        const messageElements = document.querySelectorAll('.message:not(.system)');
        const messages = Array.from(messageElements).map(el => {
            const userId = el.getAttribute('data-user-id');
            const userName = el.querySelector('.message-info').textContent.split(' ')[0];
            const content = el.querySelector('.message-content').textContent;
            const time = el.getAttribute('data-time');
            const isUser = el.classList.contains('user');
            return { userId, userName, content, time, isUser };
        });
        
        const data = {
            messages,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data));
        updateMessageCount();
    } catch (error) {
        console.error('保存消息时出错:', error);
    }
}

// 添加消息到DOM
function addMessageToDOM(userId, userName, content, time, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'other'}`;
    messageDiv.setAttribute('data-user-id', userId);
    messageDiv.setAttribute('data-time', time);
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'message-info';
    infoDiv.textContent = `${userName} ${formatTime(time)}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(infoDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

// 添加系统消息
function addSystemMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.style.background = '#e8f5e9';
    contentDiv.style.color = '#2e7d32';
    contentDiv.style.textAlign = 'center';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

// 发送消息
function sendMessage() {
    if (!currentUser) return;
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    const now = new Date().toISOString();
    addMessageToDOM(currentUser.id, currentUser.name, content, now, true);
    
    // 清空输入框
    messageInput.value = '';
    
    // 保存消息
    saveMessages();
}

// 清空聊天记录
function clearMessages() {
    if (confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
        // 保留系统消息
        const systemMessages = Array.from(document.querySelectorAll('.message.system'));
        chatMessages.innerHTML = '';
        
        // 将系统消息重新添加回去
        systemMessages.forEach(msg => chatMessages.appendChild(msg));
        
        // 清除本地存储
        localStorage.removeItem(STORAGE_KEYS.MESSAGES);
        updateMessageCount();
        
        addSystemMessage('聊天记录已清空');
    }
}

// 清除所有聊天消息（用于登出）
function clearChatMessages() {
    chatMessages.innerHTML = '';
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = '<p>欢迎来到聊天室！开始您的聊天吧。</p>';
    chatMessages.appendChild(welcomeMessage);
}

// 格式化时间
function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    
    // 如果是今天，只显示时间
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // 如果是今年，显示月日和时间
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // 其他情况显示完整日期时间
    return date.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// 滚动到底部
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 更新消息计数
function updateMessageCount() {
    const messageCount = document.querySelectorAll('.message:not(.system):not(.welcome-message)').length;
    messageCountEl.textContent = messageCount;
}

// 绑定事件监听器
function bindEventListeners() {
    // 身份验证相关事件
    showRegisterBtn.addEventListener('click', showRegisterForm);
    showLoginBtn.addEventListener('click', showLoginForm);
    loginBtn.addEventListener('click', loginUser);
    registerBtn.addEventListener('click', registerUser);
    logoutBtn.addEventListener('click', logoutUser);
    
    // 表单回车提交
    loginEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginPasswordInput.focus();
    });
    
    loginPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginUser();
    });
    
    registerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerEmailInput.focus();
    });
    
    registerEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerPasswordInput.focus();
    });
    
    registerPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerUser();
    });
    
    // 聊天相关事件
    sendMessageBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    clearMessagesBtn.addEventListener('click', clearMessages);
    
    // 窗口失去焦点时保存消息
    window.addEventListener('beforeunload', saveMessages);
}

// 启动应用
init();