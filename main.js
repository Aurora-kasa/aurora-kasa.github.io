// 通用JavaScript功能

// 音效函数
function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log('无法播放音效:', e));
  }
}

// 为带有sound-hover类的元素添加悬停音效
function setupHoverSounds() {
  document.querySelectorAll('.sound-hover').forEach(element => {
    element.addEventListener('mouseenter', function() {
      playSound('hover-sound');
    });
  });
}

// 为带有sound-click类的元素添加点击音效
function setupClickSounds() {
  document.querySelectorAll('.sound-click').forEach(element => {
    element.addEventListener('click', function() {
      playSound('click-sound');
    });
  });
}

// 导航栏滚动效果
function setupNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-dark/95', 'backdrop-blur-lg', 'shadow-lg');
      navbar.classList.remove('py-4');
      navbar.classList.add('py-2');
      
      if (backToTop) {
        backToTop.classList.remove('opacity-0', 'invisible');
        backToTop.classList.add('opacity-100', 'visible');
      }
    } else {
      navbar.classList.remove('bg-dark/95', 'backdrop-blur-lg', 'shadow-lg');
      navbar.classList.remove('py-2');
      navbar.classList.add('py-4');
      
      if (backToTop) {
        backToTop.classList.add('opacity-0', 'invisible');
        backToTop.classList.remove('opacity-100', 'visible');
      }
    }
  });
  
  // 触发一次滚动事件以更新导航栏状态
  window.dispatchEvent(new Event('scroll'));
}

// 移动端菜单功能
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      menuToggle.innerHTML = mobileMenu.classList.contains('hidden') ? 
        '<i class="fa fa-bars"></i>' : '<i class="fa fa-times"></i>';
    });
    
    // 移动端菜单点击关闭
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        menuToggle.innerHTML = '<i class="fa fa-bars"></i>';
      });
    });
  }
}

// 返回顶部按钮功能
function setupBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  
  if (backToTop) {
    backToTop.addEventListener('click', function() {
      playSound('scroll-sound');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// 数字计数动画
function setupCounters() {
  const counters = document.querySelectorAll('.counter');
  const speed = 200;
  
  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const inc = target / speed;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + inc);
        setTimeout(animateCounters, 1);
      } else {
        counter.innerText = counter.getAttribute('data-target');
      }
    });
  };
  
  // 监听元素是否进入视口
  const observerOptions = {
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('counter')) {
          // 延迟启动计数动画
          setTimeout(() => {
            animateCounters();
          }, 300);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // 观察所有计数器元素
  counters.forEach(counter => {
    observer.observe(counter);
  });
}

// 图片加载动画
function setupImageLoading() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('opacity-100');
    } else {
      img.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      img.addEventListener('load', () => {
        img.classList.remove('opacity-0');
        img.classList.add('opacity-100');
      });
    }
  });
}

// 游戏筛选功能
function setupGameFilter() {
  const filterButtons = document.querySelectorAll('.game-filter-btn');
  const gameCards = document.querySelectorAll('.game-card');
  
  if (filterButtons.length > 0 && gameCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        playSound('click-sound');
        
        // 移除所有按钮的active状态
        filterButtons.forEach(btn => {
          btn.classList.remove('active', 'bg-primary', 'text-white');
          btn.classList.add('bg-dark/60', 'text-gray-300');
        });
        
        // 为当前点击的按钮添加active状态
        button.classList.add('active', 'bg-primary', 'text-white');
        button.classList.remove('bg-dark/60', 'text-gray-300');
        
        const filter = button.getAttribute('data-filter');
        
        // 筛选游戏卡片
        gameCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
            // 添加动画效果
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
}

// 联系表单提交处理
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      playSound('click-sound');
      
      // 获取表单数据
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      
      // 简单的表单验证
      if (!name || !email || !subject || !message) {
        alert('请填写所有必填字段');
        return;
      }
      
      // 模拟表单提交
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 发送中...';
      
      // 模拟API请求延迟
      setTimeout(() => {
        // 重置表单
        contactForm.reset();
        
        // 显示成功消息
        alert('消息发送成功，我们会尽快回复您！');
        
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }, 1500);
    });
  }
}

// 页面初始化
function initPage() {
  // 加载音效组件
  fetch('sounds.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      
      // 初始化音效
      setupHoverSounds();
      setupClickSounds();
    });
  
  // 加载导航栏
  fetch('navbar.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      
      // 初始化导航功能
      setupNavbarScroll();
      setupMobileMenu();
    });
  
  // 加载页脚
  fetch('footer.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    });
  
  // 初始化其他功能
  setupBackToTop();
  setupImageLoading();
  setupCounters();
  setupGameFilter();
  setupContactForm();
  
  console.log('Project-X 游戏工作室网站已加载');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);