<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const type = computed(() => props.component.type)
const props_data = computed(() => props.component.props || {})

// 解析选项
function parseOptions(optionsString) {
  if (!optionsString) return []
  return optionsString.split('\n').filter(opt => opt.trim()).map(opt => {
    const [value, label] = opt.split('|')
    return {
      value: value?.trim() || '',
      label: label?.trim() || opt.trim()
    }
  })
}

// 渲染登录表单
function renderLoginForm() {
  const p = props_data.value
  const showRemember = p.showRemember !== false
  const showForgot = p.showForgot !== false
  
  return `
    <h2 class="form-title">${p.title || '用户登录'}</h2>
    <div class="form-group">
      <label for="login_username">用户名</label>
      <input type="text" id="login_username" name="username" required placeholder="请输入用户名">
    </div>
    <div class="form-group">
      <label for="login_password">密码</label>
      <input type="password" id="login_password" name="password" required placeholder="请输入密码">
    </div>
    ${showRemember ? `<div class="form-group form-checkbox"><label><input type="checkbox" name="remember"> ${p.rememberText || '记住我'}</label></div>` : ''}
    <div class="form-group">
      <button type="submit" class="btn-primary">${p.submitText || '登录'}</button>
    </div>
    ${showForgot ? `<div class="form-links"><a href="${p.forgotLink || '#'}">${p.forgotText || '忘记密码？'}</a></div>` : ''}
  `
}

// 渲染注册表单
function renderRegisterForm() {
  const p = props_data.value
  const showAgreement = p.showAgreement !== false
  const agreementRequired = p.agreementRequired !== false
  
  return `
    <h2 class="form-title">${p.title || '用户注册'}</h2>
    <div class="form-group">
      <label for="register_username">用户名</label>
      <input type="text" id="register_username" name="username" required placeholder="请输入用户名">
    </div>
    <div class="form-group">
      <label for="register_email">邮箱</label>
      <input type="email" id="register_email" name="email" required placeholder="请输入邮箱">
    </div>
    <div class="form-group">
      <label for="register_password">密码</label>
      <input type="password" id="register_password" name="password" required placeholder="请输入密码">
    </div>
    <div class="form-group">
      <label for="register_confirm_password">确认密码</label>
      <input type="password" id="register_confirm_password" name="confirmPassword" required placeholder="请再次输入密码">
    </div>
    ${showAgreement ? `<div class="form-group form-checkbox"><label><input type="checkbox" name="agreement" ${agreementRequired ? 'required' : ''}> ${p.agreementText || '我已阅读并同意'} <a href="${p.agreementLink || '#'}">《用户协议》</a></label></div>` : ''}
    <div class="form-group">
      <button type="submit" class="btn-primary">${p.submitText || '注册'}</button>
    </div>
  `
}

// 渲染联系表单
function renderContactForm() {
  const p = props_data.value
  let html = `<h2 class="form-title">${p.title || '联系我们'}</h2>`
  
  if (p.showName !== false) {
    const required = p.nameRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="contact_name">${p.nameLabel || '姓名'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="contact_name" name="name" ${required} placeholder="${p.namePlaceholder || '请输入您的姓名'}">
    </div>`
  }
  
  if (p.showEmail !== false) {
    const required = p.emailRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="contact_email">${p.emailLabel || '邮箱'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="email" id="contact_email" name="email" ${required} placeholder="${p.emailPlaceholder || '请输入您的邮箱'}">
    </div>`
  }
  
  if (p.showPhone !== false) {
    const required = p.phoneRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="contact_phone">${p.phoneLabel || '电话'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="tel" id="contact_phone" name="phone" ${required} placeholder="${p.phonePlaceholder || '请输入您的电话'}">
    </div>`
  }
  
  if (p.showSubject !== false) {
    const required = p.subjectRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="contact_subject">${p.subjectLabel || '主题'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="contact_subject" name="subject" ${required} placeholder="${p.subjectPlaceholder || '请输入主题'}">
    </div>`
  }
  
  if (p.showMessage !== false) {
    const required = p.messageRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="contact_message">${p.messageLabel || '留言'}${required ? '<span class="required">*</span>' : ''}</label>
      <textarea id="contact_message" name="message" rows="${p.messageRows || 5}" ${required} placeholder="${p.messagePlaceholder || '请输入留言内容'}"></textarea>
    </div>`
  }
  
  html += `
    <div class="form-group">
      <button type="submit" class="btn-primary">${p.submitText || '提交'}</button>
    </div>`
  
  return html
}

// 渲染搜索表单
function renderSearchForm() {
  const p = props_data.value
  const showCategory = p.showCategory !== false
  const options = parseOptions(p.categoryOptions || '全部|全部\n新闻|新闻\n产品|产品\n案例|案例')
  
  let html = ''
  
  if (showCategory) {
    html += `
    <div class="search-category">
      <label for="search_category">${p.categoryLabel || '分类'}:</label>
      <select id="search_category" name="category">
        ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
      </select>
    </div>`
  }
  
  html += `
    <div class="search-input-group">
      <input type="search" name="keyword" placeholder="${p.placeholder || '搜索...'}">
      <button type="submit">${p.buttonText || '搜索'}</button>
    </div>`
  
  return html
}

// 渲染评论表单
function renderCommentForm() {
  const p = props_data.value
  const showRating = p.showRating !== false
  const showAuthor = p.showAuthor !== false
  const showEmail = p.showEmail !== false
  const maxRating = p.maxRating || 5
  
  let html = `<h3 class="form-title">${p.title || '发表评论'}</h3>`
  
  if (showRating) {
    let stars = ''
    for (let i = 1; i <= maxRating; i++) {
      stars += `<span class="star" data-value="${i}">★</span>`
    }
    html += `
    <div class="form-group">
      <label>${p.ratingLabel || '评分'}:</label>
      <div class="rating-input" data-name="rating">${stars}</div>
    </div>`
  }
  
  if (showAuthor) {
    const required = p.authorRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="comment_author">${p.authorLabel || '昵称'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="comment_author" name="author" ${required} placeholder="${p.authorPlaceholder || '请输入昵称'}">
    </div>`
  }
  
  if (showEmail) {
    const required = p.emailRequired !== false ? 'required' : ''
    html += `
    <div class="form-group">
      <label for="comment_email">${p.emailLabel || '邮箱'}${required ? '<span class="required">*</span>' : ''}</label>
      <input type="email" id="comment_email" name="email" ${required} placeholder="${p.emailPlaceholder || '请输入邮箱（不公开）'}">
    </div>`
  }
  
  const required = p.messageRequired !== false ? 'required' : ''
  html += `
    <div class="form-group">
      <label for="comment_content">${p.messageLabel || '评论内容'}${required ? '<span class="required">*</span>' : ''}</label>
      <textarea id="comment_content" name="content" rows="${p.messageRows || 3}" ${required} placeholder="${p.messagePlaceholder || '请输入您的评论...'}"></textarea>
    </div>
    <div class="form-group">
      <button type="submit" class="btn-primary">${p.submitText || '提交评论'}</button>
    </div>`
  
  return html
}

// 渲染自定义表单
function renderCustomForm() {
  const p = props_data.value
  const formItems = p.formItems || []
  
  let html = ''
  
  // 遍历自定义表单项
  formItems.forEach((item, index) => {
    const fieldId = `custom_${item.id || index}`
    const requiredAttr = item.required ? 'required' : ''
    const requiredMark = item.required ? '<span class="required">*</span>' : ''
    
    if (item.type === 'text' || item.type === 'email' || item.type === 'tel' || item.type === 'password') {
      html += `
      <div class="form-group">
        <label for="${fieldId}">${item.label}${requiredMark}</label>
        <input type="${item.type}" id="${fieldId}" name="${item.id}" ${requiredAttr} placeholder="${item.placeholder || ''}">
      </div>`
    } else if (item.type === 'textarea') {
      html += `
      <div class="form-group">
        <label for="${fieldId}">${item.label}${requiredMark}</label>
        <textarea id="${fieldId}" name="${item.id}" rows="${item.rows || 4}" ${requiredAttr} placeholder="${item.placeholder || ''}"></textarea>
      </div>`
    } else if (item.type === 'select') {
      const options = item.options || []
      html += `
      <div class="form-group">
        <label for="${fieldId}">${item.label}${requiredMark}</label>
        <select id="${fieldId}" name="${item.id}" ${requiredAttr}>
          <option value="">请选择</option>
          ${options.map(opt => `<option value="${opt.value || opt}">${opt.label || opt}</option>`).join('')}
        </select>
      </div>`
    } else if (item.type === 'checkbox') {
      html += `
      <div class="form-group form-checkbox">
        <label><input type="checkbox" name="${item.id}" ${requiredAttr}> ${item.label}</label>
      </div>`
    } else if (item.type === 'radio') {
      const options = item.options || []
      html += `
      <div class="form-group">
        <label>${item.label}${requiredMark}</label>
        <div class="radio-group">
          ${options.map(opt => `
            <label class="radio-label">
              <input type="radio" name="${item.id}" value="${opt.value || opt}" ${requiredAttr}>
              ${opt.label || opt}
            </label>
          `).join('')}
        </div>
      </div>`
    } else if (item.type === 'description') {
      const textColor = item.color || '#333333'
      const fontSize = item.fontSize || 14
      const textAlign = item.textAlign || 'left'
      const bgColor = item.bgColor || '#f5f5f5'
      html += `
      <div class="form-description" style="color: ${textColor}; font-size: ${fontSize}px; text-align: ${textAlign}; background-color: ${bgColor};">
        <p>${item.label || ''}</p>
      </div>`
    }
  })
  
  html += `
    <div class="form-group">
      <button type="submit" class="btn-primary">${p.submitText || '提交'}</button>
    </div>`
  
  return html
}

// 根据类型渲染表单内容
const formContent = computed(() => {
  switch (type.value) {
    case 'loginForm':
      return renderLoginForm()
    case 'registerForm':
      return renderRegisterForm()
    case 'contactForm':
      return renderContactForm()
    case 'searchForm':
      return renderSearchForm()
    case 'commentForm':
      return renderCommentForm()
    case 'customForm':
      return renderCustomForm()
    default:
      return '<p>未知表单类型</p>'
  }
})
</script>

<template>
  <div class="form-widget" v-html="formContent"></div>
</template>

<style scoped>
.form-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.form-widget :deep(h2),
.form-widget :deep(h3) {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
  text-align: center;
}

.form-widget :deep(.form-group) {
  margin-bottom: 15px;
}

.form-widget :deep(.form-group label) {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.form-widget :deep(.form-group label .required) {
  color: #ff4d4f;
  margin-left: 2px;
}

.form-widget :deep(.form-group input),
.form-widget :deep(.form-group select),
.form-widget :deep(.form-group textarea) {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-widget :deep(.form-group input:focus),
.form-widget :deep(.form-group select:focus),
.form-widget :deep(.form-group textarea:focus) {
  outline: none;
  border-color: #40a9ff;
}

.form-widget :deep(.form-group textarea) {
  resize: vertical;
  min-height: 80px;
}

.form-widget :deep(.btn-primary) {
  width: 100%;
  padding: 10px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.form-widget :deep(.btn-primary:hover) {
  background-color: #40a9ff;
}

.form-widget :deep(.form-checkbox label) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-widget :deep(.form-checkbox input) {
  width: auto;
}

.form-widget :deep(.form-links) {
  text-align: center;
  margin-top: 10px;
}

.form-widget :deep(.form-links a) {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.form-widget :deep(.form-links a:hover) {
  text-decoration: underline;
}

/* 搜索表单样式 */
.form-widget :deep(.search-category) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.form-widget :deep(.search-category label) {
  margin: 0;
  white-space: nowrap;
}

.form-widget :deep(.search-category select) {
  flex: 1;
}

.form-widget :deep(.search-input-group) {
  display: flex;
  gap: 10px;
}

.form-widget :deep(.search-input-group input) {
  flex: 1;
}

.form-widget :deep(.search-input-group button) {
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 评分样式 */
.form-widget :deep(.rating-input) {
  display: flex;
  gap: 5px;
}

.form-widget :deep(.star) {
  font-size: 24px;
  color: #d9d9d9;
  cursor: pointer;
}

.form-widget :deep(.star.active) {
  color: #ff4d4f;
}

/* 文字描述样式 */
.form-widget :deep(.form-description) {
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.6;
}

.form-widget :deep(.form-description p) {
  margin: 0;
}

/* 单选按钮组样式 */
.form-widget :deep(.radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.form-widget :deep(.radio-label) {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.form-widget :deep(.radio-label input) {
  width: auto;
}
</style>
