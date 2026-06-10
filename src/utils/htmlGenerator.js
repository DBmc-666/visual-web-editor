/**
 * @file HTML生成器模块
 * @description 将编辑器页面数据转换为可导出的HTML代码
 * @features 支持本地图片打包导出、嵌套组件处理、响应式布局生成
 * @dependencies JSZip, file-saver
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * HTML字符转义函数
 * 转义HTML特殊字符防止XSS攻击和语法错误
 * @param {string} str - 需要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * HTML属性值转义函数
 * 用于转义HTML属性中的特殊字符，同时处理换行符和制表符
 * @param {string} str - 需要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeAttr(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

/**
 * 计算CSS阴影样式
 * @param {Object} style - 组件样式对象
 * @returns {string} - CSS阴影值，无阴影时返回空字符串
 */
function getShadowCSS(style) {
  const x = style?.shadowX || 0
  const y = style?.shadowY || 0
  const blur = style?.shadowBlur || 0
  const color = style?.shadowColor || 'rgba(0,0,0,0)'
  if (blur === 0 && x === 0 && y === 0) return ''
  return `${x}px ${y}px ${blur}px ${color}`
}

/**
 * 计算CSS边框样式
 * @param {Object} style - 组件样式对象
 * @returns {string} - CSS边框值，无边框时返回空字符串
 */
function getBorderCSS(style) {
  const width = style?.borderWidth || 0
  const color = style?.borderColor || '#000000'
  const borderStyle = style?.borderStyle || 'none'
  if (width === 0 || borderStyle === 'none') return ''
  return `${width}px ${borderStyle} ${color}`
}

/**
 * 计算CSS内边距样式
 * 支持分别设置四个方向或统一设置
 * @param {Object} style - 组件样式对象
 * @returns {string} - CSS内边距值，无内边距时返回空字符串
 */
function getPaddingCSS(style) {
  if (style?.paddingTop || style?.paddingBottom || style?.paddingLeft || style?.paddingRight) {
    return `${style.paddingTop || style.padding || 0}px ${style.paddingRight || style.padding || 0}px ${style.paddingBottom || style.padding || 0}px ${style.paddingLeft || style.padding || 0}px`
  }
  if (style?.padding) return `${style.padding}px`
  return ''
}

/**
 * 生成组件唯一CSS类名
 * @param {Object} component - 组件数据对象
 * @returns {string} - 唯一的CSS类名
 */
function generateComponentId(component) {
  return `component-${component.id.replace(/-/g, '')}`
}

/**
 * 将样式对象转换为 CSS 类定义（用于生成可读的CSS）
 * @param {Object} component - 组件数据
 * @param {number} pageWidth - 页面设计宽度
 * @param {number} pageHeight - 页面设计高度
 * @returns {string}
 */
function componentStyleToCSSClass(component, pageWidth, pageHeight) {
  const style = component.style || {}
  const className = generateComponentId(component)
  const cssParts = []

  // 位置和尺寸 - 使用固定像素值，保持原始比例
  cssParts.push(`.${className} {`)
  cssParts.push(`  position: absolute;`)
  cssParts.push(`  left: ${Math.round(component.left)}px;`)
  cssParts.push(`  top: ${Math.round(component.top)}px;`)
  cssParts.push(`  width: ${Math.round(component.width)}px;`)
  cssParts.push(`  height: ${Math.round(component.height)}px;`)
  cssParts.push(`  box-sizing: border-box;`)

  // 背景和透明度
  if (style.backgroundColor) cssParts.push(`  background-color: ${style.backgroundColor};`)
  if (style.opacity && style.opacity !== 1) cssParts.push(`  opacity: ${style.opacity};`)

  // 边框
  const border = getBorderCSS(style)
  if (border) cssParts.push(`  border: ${border};`)
  if (style.borderRadius) cssParts.push(`  border-radius: ${style.borderRadius}px;`)

  // 内边距
  const padding = getPaddingCSS(style)
  if (padding) cssParts.push(`  padding: ${padding};`)

  // 阴影
  const shadow = getShadowCSS(style)
  if (shadow) cssParts.push(`  box-shadow: ${shadow};`)

  // 旋转
  if (style.rotate) cssParts.push(`  transform: rotate(${style.rotate}deg);`)

  // 文字样式
  if (style.fontSize) cssParts.push(`  font-size: ${style.fontSize}px;`)
  if (style.color) cssParts.push(`  color: ${style.color};`)
  if (style.fontWeight) cssParts.push(`  font-weight: ${style.fontWeight};`)
  if (style.lineHeight) cssParts.push(`  line-height: ${style.lineHeight};`)
  if (style.letterSpacing) cssParts.push(`  letter-spacing: ${style.letterSpacing}px;`)
  if (style.textDecoration && style.textDecoration !== 'none') cssParts.push(`  text-decoration: ${style.textDecoration};`)
  if (style.textTransform && style.textTransform !== 'none') cssParts.push(`  text-transform: ${style.textTransform};`)

  // 文本对齐
  if (style.textAlign) cssParts.push(`  text-align: ${style.textAlign};`)

  cssParts.push(`}`)

  // 按钮组件的hover和active样式
  if (component.type === 'button') {
    const hoverBgColor = style.hoverBackgroundColor || '#40a9ff'
    const activeBgColor = style.activeBackgroundColor || '#096dd9'
    
    cssParts.push(``)
    cssParts.push(`.${className}:hover {`)
    cssParts.push(`  background-color: ${hoverBgColor};`)
    cssParts.push(`}`)
    cssParts.push(``)
    cssParts.push(`.${className}:active {`)
    cssParts.push(`  background-color: ${activeBgColor};`)
    cssParts.push(`}`)
  }

  return cssParts.join('\n')
}

/**
 * 将样式对象转换为内联样式字符串（用于简单组件）
 * @param {Object} component - 组件数据
 * @param {number} pageWidth - 页面设计宽度
 * @param {number} pageHeight - 页面设计高度
 * @returns {string}
 */
function componentStyleToString(component, pageWidth, pageHeight) {
  const style = component.style || {}
  const cssParts = []

  // 位置和尺寸 - 使用百分比实现响应式
  const leftPercent = (component.left / pageWidth) * 100
  const topPercent = (component.top / pageHeight) * 100
  const widthPercent = (component.width / pageWidth) * 100
  const heightPercent = (component.height / pageHeight) * 100

  cssParts.push(`position: absolute`)
  cssParts.push(`left: ${leftPercent}%`)
  cssParts.push(`top: ${topPercent}%`)
  cssParts.push(`width: ${widthPercent}%`)
  cssParts.push(`height: ${heightPercent}%`)

  // 背景和透明度
  if (style.backgroundColor) cssParts.push(`background-color: ${style.backgroundColor}`)
  if (style.opacity && style.opacity !== 1) cssParts.push(`opacity: ${style.opacity}`)

  // 边框
  const border = getBorderCSS(style)
  if (border) cssParts.push(`border: ${border}`)
  if (style.borderRadius) cssParts.push(`border-radius: ${style.borderRadius}px`)

  // 内边距
  const padding = getPaddingCSS(style)
  if (padding) cssParts.push(`padding: ${padding}`)

  // 阴影
  const shadow = getShadowCSS(style)
  if (shadow) cssParts.push(`box-shadow: ${shadow}`)

  // 旋转
  if (style.rotate) cssParts.push(`transform: rotate(${style.rotate}deg)`)

  // 文字样式
  if (style.fontSize) cssParts.push(`font-size: ${style.fontSize}px`)
  if (style.color) cssParts.push(`color: ${style.color}`)
  if (style.fontWeight) cssParts.push(`font-weight: ${style.fontWeight}`)
  if (style.lineHeight) cssParts.push(`line-height: ${style.lineHeight}`)
  if (style.letterSpacing) cssParts.push(`letter-spacing: ${style.letterSpacing}px`)
  if (style.textDecoration && style.textDecoration !== 'none') cssParts.push(`text-decoration: ${style.textDecoration}`)
  if (style.textTransform && style.textTransform !== 'none') cssParts.push(`text-transform: ${style.textTransform}`)

  // 盒模型
  cssParts.push(`box-sizing: border-box`)

  return cssParts.join('; ')
}

/**
 * 从 base64 提取图片数据
 * @param {string} base64 - base64 字符串
 * @returns {Object} - { data: ArrayBuffer, extension: string }
 */
function extractBase64Image(base64) {
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) return null

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1]
  const data = matches[2]

  // 将 base64 转换为 ArrayBuffer
  const binaryString = atob(data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return {
    data: bytes,
    extension
  }
}

/**
 * 获取组件的 HTML 标签和内容
 * @param {Object} component - 组件数据
 * @param {Object} imagePaths - 图片路径映射
 * @param {number} pageWidth - 页面设计宽度
 * @param {number} pageHeight - 页面设计高度
 * @returns {Object}
 */
function getComponentTag(component, imagePaths = {}, pageWidth, pageHeight) {
  const { type, props = {} } = component
  const style = component.style || {}
  const inlineStyle = componentStyleToString(component, pageWidth, pageHeight)

  switch (type) {
    case 'text':
      return {
        tag: 'div',
        content: escapeHTML(props.content || '文本'),
        style: inlineStyle,
        attrs: ''
      }

    case 'image':
    const objectFit = props.objectFit || 'contain'
      // 如果是本地图片，使用新路径
      let imageSrc = props.src || 'https://via.placeholder.com/200'
      if (props.localImage && imagePaths[component.id]) {
        imageSrc = imagePaths[component.id]
      }
      const hasLink = props.hasLink || false
      const imageHref = props.href || '#'
      const imageTarget = props.target || '_blank'
      
      const imgTag = `<img src="${imageSrc}" alt="${props.alt || '图片'}" style="object-fit: ${objectFit}; width: 100%; height: 100%; display: block;">`
      
      if (hasLink) {
        return {
          tag: 'a',
          content: imgTag,
          style: inlineStyle,
          attrs: `href="${imageHref}" target="${imageTarget}"`
        }
      }
      
      return {
        tag: 'div',
        content: imgTag,
        style: inlineStyle,
        attrs: ''
      }

    case 'button':
      const actionType = props.actionType || 'link'
      let onClickAttr = ''
      let buttonId = `btn_${component.id.replace(/-/g, '_')}`
      const btnContent = props.content || '按钮'
      
      switch (actionType) {
        case 'link':
          const btnHref = props.href || '#'
          const btnTarget = props.target || '_self'
          onClickAttr = `onclick="navigateTo('${escapeAttr(btnHref)}', '${escapeAttr(btnTarget)}')"`
          break
        case 'alert':
          const msg = props.alertMessage || '点击了按钮'
          onClickAttr = `onclick="showAlert('${escapeAttr(msg)}')"`
          break
        case 'api':
          const apiUrl = props.apiConfig?.url || ''
          const apiMethod = props.apiConfig?.method || 'POST'
          // 使用data属性存储JSON，避免HTML属性值换行问题
          const apiBodyEncoded = props.apiConfig?.body ? encodeURIComponent(JSON.stringify(props.apiConfig.body)) : ''
          onClickAttr = `onclick="callAPIFromData(this, '${escapeAttr(apiUrl)}', '${escapeAttr(apiMethod)}', '${apiBodyEncoded}')"`
          break
      }
      
      return {
        tag: 'button',
        content: escapeHTML(btnContent),
        style: inlineStyle + '; border: none; cursor: pointer;',
        attrs: `id="${buttonId}" ${onClickAttr}`
      }

    case 'container':
      return {
        tag: 'div',
        content: '',
        style: inlineStyle,
        attrs: ''
      }

    case 'loginForm':
      const loginFormId = `login_form_${component.id.replace(/-/g, '_')}`
      const loginTitle = props.title || '用户登录'
      const loginSubmitText = props.submitText || '登录'
      const loginShowRemember = props.showRemember !== false
      const loginRememberText = props.rememberText || '记住我'
      const loginShowForgot = props.showForgot !== false
      const loginForgotText = props.forgotText || '忘记密码？'
      const loginForgotLink = props.forgotLink || '#'
      const loginApiUrl = props.apiUrl || '/api/login'
      const loginApiMethod = props.apiMethod || 'POST'
      
      const loginFormContent = `
    <h2 class="form-title">${escapeHTML(loginTitle)}</h2>
    <div class="form-group">
      <label for="login_username">用户名</label>
      <input type="text" id="login_username" name="username" required placeholder="请输入用户名">
    </div>
    <div class="form-group">
      <label for="login_password">密码</label>
      <input type="password" id="login_password" name="password" required placeholder="请输入密码">
    </div>
    ${loginShowRemember ? `<div class="form-group form-checkbox"><label><input type="checkbox" name="remember"> ${escapeHTML(loginRememberText)}</label></div>` : ''}
    <div class="form-group">
      <button type="submit" class="btn-primary">${escapeHTML(loginSubmitText)}</button>
    </div>
    ${loginShowForgot ? `<div class="form-links"><a href="${escapeAttr(loginForgotLink)}">${escapeHTML(loginForgotText)}</a></div>` : ''}`
      
      return {
        tag: 'form',
        content: loginFormContent,
        style: inlineStyle,
        attrs: `id="${loginFormId}" action="${escapeAttr(loginApiUrl)}" method="${escapeAttr(loginApiMethod)}"`
      }

    case 'registerForm':
      const registerFormId = `register_form_${component.id.replace(/-/g, '_')}`
      const registerTitle = props.title || '用户注册'
      const registerSubmitText = props.submitText || '注册'
      const registerShowAgreement = props.showAgreement !== false
      const registerAgreementText = props.agreementText || '我已阅读并同意'
      const registerAgreementLink = props.agreementLink || '#'
      const registerAgreementRequired = props.agreementRequired !== false
      const registerApiUrl = props.apiUrl || '/api/register'
      const registerApiMethod = props.apiMethod || 'POST'
      
      const registerFormContent = `
    <h2 class="form-title">${escapeHTML(registerTitle)}</h2>
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
    ${registerShowAgreement ? `<div class="form-group form-checkbox"><label><input type="checkbox" name="agreement" ${registerAgreementRequired ? 'required' : ''}> ${escapeHTML(registerAgreementText)} <a href="${escapeAttr(registerAgreementLink)}">《用户协议》</a></label></div>` : ''}
    <div class="form-group">
      <button type="submit" class="btn-primary">${escapeHTML(registerSubmitText)}</button>
    </div>`
      
      return {
        tag: 'form',
        content: registerFormContent,
        style: inlineStyle,
        attrs: `id="${registerFormId}" action="${escapeAttr(registerApiUrl)}" method="${escapeAttr(registerApiMethod)}"`
      }

    case 'contactForm':
      const contactFormId = `contact_form_${component.id.replace(/-/g, '_')}`
      const contactTitle = props.title || '联系我们'
      const contactSubmitText = props.submitText || '提交'
      const contactApiUrl = props.apiUrl || '/api/contact'
      const contactApiMethod = props.apiMethod || 'POST'
      
      let contactFormContent = `<h2 class="form-title">${escapeHTML(contactTitle)}</h2>`
      
      if (props.showName !== false) {
        contactFormContent += `
    <div class="form-group">
      <label for="contact_name">${escapeHTML(props.nameLabel || '姓名')}${props.nameRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="contact_name" name="name" ${props.nameRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.namePlaceholder || '请输入您的姓名')}">
    </div>`
      }
      
      if (props.showEmail !== false) {
        contactFormContent += `
    <div class="form-group">
      <label for="contact_email">${escapeHTML(props.emailLabel || '邮箱')}${props.emailRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="email" id="contact_email" name="email" ${props.emailRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.emailPlaceholder || '请输入您的邮箱')}">
    </div>`
      }
      
      if (props.showPhone !== false) {
        contactFormContent += `
    <div class="form-group">
      <label for="contact_phone">${escapeHTML(props.phoneLabel || '电话')}${props.phoneRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="tel" id="contact_phone" name="phone" ${props.phoneRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.phonePlaceholder || '请输入您的电话')}">
    </div>`
      }
      
      if (props.showSubject !== false) {
        contactFormContent += `
    <div class="form-group">
      <label for="contact_subject">${escapeHTML(props.subjectLabel || '主题')}${props.subjectRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="contact_subject" name="subject" ${props.subjectRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.subjectPlaceholder || '请输入主题')}">
    </div>`
      }
      
      if (props.showMessage !== false) {
        contactFormContent += `
    <div class="form-group">
      <label for="contact_message">${escapeHTML(props.messageLabel || '留言')}${props.messageRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <textarea id="contact_message" name="message" rows="${props.messageRows || 5}" ${props.messageRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.messagePlaceholder || '请输入留言内容')}"></textarea>
    </div>`
      }
      
      contactFormContent += `
    <div class="form-group">
      <button type="submit" class="btn-primary">${escapeHTML(contactSubmitText)}</button>
    </div>`
      
      return {
        tag: 'form',
        content: contactFormContent,
        style: inlineStyle,
        attrs: `id="${contactFormId}" action="${escapeAttr(contactApiUrl)}" method="${escapeAttr(contactApiMethod)}"`
      }

    case 'searchForm':
      const searchFormId = `search_form_${component.id.replace(/-/g, '_')}`
      const searchPlaceholder = props.placeholder || '搜索...'
      const searchButtonText = props.buttonText || '搜索'
      const searchShowCategory = props.showCategory !== false
      const searchCategoryLabel = props.categoryLabel || '分类'
      const searchApiUrl = props.apiUrl || '/api/search'
      const searchApiMethod = props.apiMethod || 'GET'
      
      let searchFormContent = ''
      
      if (searchShowCategory) {
        searchFormContent += `
    <div class="search-category">
      <label for="search_category">${escapeHTML(searchCategoryLabel)}:</label>
      <select id="search_category" name="category">`
        
        if (props.categoryOptions) {
          const categoryOptions = props.categoryOptions.split('\n').filter(opt => opt.trim())
          categoryOptions.forEach(opt => {
            const [value, label] = opt.split('|')
            const optValue = value?.trim() || ''
            const optLabel = label?.trim() || optValue
            searchFormContent += `
        <option value="${escapeAttr(optValue)}">${escapeHTML(optLabel)}</option>`
          })
        }
        
        searchFormContent += `
      </select>
    </div>`
      }
      
      searchFormContent += `
    <div class="search-input-group">
      <input type="search" name="keyword" placeholder="${escapeAttr(searchPlaceholder)}">
      <button type="submit">${escapeHTML(searchButtonText)}</button>
    </div>`
      
      return {
        tag: 'form',
        content: searchFormContent,
        style: inlineStyle,
        attrs: `id="${searchFormId}" action="${escapeAttr(searchApiUrl)}" method="${escapeAttr(searchApiMethod)}"`
      }

    case 'commentForm':
      const commentFormId = `comment_form_${component.id.replace(/-/g, '_')}`
      const commentTitle = props.title || '发表评论'
      const commentSubmitText = props.submitText || '提交评论'
      const commentApiUrl = props.apiUrl || '/api/comment'
      const commentApiMethod = props.apiMethod || 'POST'
      
      let commentFormContent = `<h3 class="form-title">${escapeHTML(commentTitle)}</h3>`
      
      if (props.showRating !== false) {
        const maxRating = props.maxRating || 5
        let ratingStars = ''
        for (let i = 1; i <= maxRating; i++) {
          ratingStars += `<span class="star" data-value="${i}">&#9733;</span>`
        }
        commentFormContent += `
    <div class="form-group">
      <label>${escapeHTML(props.ratingLabel || '评分')}:</label>
      <div class="rating-input" data-name="rating">${ratingStars}</div>
    </div>`
      }
      
      if (props.showAuthor !== false) {
        commentFormContent += `
    <div class="form-group">
      <label for="comment_author">${escapeHTML(props.authorLabel || '昵称')}${props.authorRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="text" id="comment_author" name="author" ${props.authorRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.authorPlaceholder || '请输入昵称')}">
    </div>`
      }
      
      if (props.showEmail !== false) {
        commentFormContent += `
    <div class="form-group">
      <label for="comment_email">${escapeHTML(props.emailLabel || '邮箱')}${props.emailRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <input type="email" id="comment_email" name="email" ${props.emailRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.emailPlaceholder || '请输入邮箱（不公开）')}">
    </div>`
      }
      
      commentFormContent += `
    <div class="form-group">
      <label for="comment_content">${escapeHTML(props.messageLabel || '评论内容')}${props.messageRequired !== false ? '<span class="required">*</span>' : ''}</label>
      <textarea id="comment_content" name="content" rows="${props.messageRows || 3}" ${props.messageRequired !== false ? 'required' : ''} placeholder="${escapeAttr(props.messagePlaceholder || '请输入您的评论...')}"></textarea>
    </div>
    <div class="form-group">
      <button type="submit" class="btn-primary">${escapeHTML(commentSubmitText)}</button>
    </div>`
      
      return {
        tag: 'form',
        content: commentFormContent,
        style: inlineStyle,
        attrs: `id="${commentFormId}" action="${escapeAttr(commentApiUrl)}" method="${escapeAttr(commentApiMethod)}"`
      }

    case 'customForm':
      const customFormId = `custom_form_${component.id.replace(/-/g, '_')}`
      const customTitle = props.title || '自定义表单'
      const customSubmitText = props.submitText || '提交'
      const customApiUrl = props.apiUrl || '/api/submit-form'
      const customApiMethod = props.apiMethod || 'POST'
      const customFormItems = props.formItems || []
      
      let customFormContent = `<h2 class="form-title">${escapeHTML(customTitle)}</h2>`
      
      // 遍历自定义表单项
      customFormItems.forEach((item, index) => {
        const fieldId = `custom_${item.id || index}`
        const requiredAttr = item.required ? 'required' : ''
        const requiredMark = item.required ? '<span class="required">*</span>' : ''
        
        if (item.type === 'text' || item.type === 'email' || item.type === 'tel' || item.type === 'password') {
          customFormContent += `
    <div class="form-group">
      <label for="${fieldId}">${escapeHTML(item.label)}${requiredMark}</label>
      <input type="${escapeAttr(item.type)}" id="${fieldId}" name="${escapeAttr(item.id)}" ${requiredAttr} placeholder="${escapeAttr(item.placeholder || '')}">
    </div>`
        } else if (item.type === 'textarea') {
          customFormContent += `
    <div class="form-group">
      <label for="${fieldId}">${escapeHTML(item.label)}${requiredMark}</label>
      <textarea id="${fieldId}" name="${escapeAttr(item.id)}" rows="${item.rows || 4}" ${requiredAttr} placeholder="${escapeAttr(item.placeholder || '')}"></textarea>
    </div>`
        } else if (item.type === 'select') {
          const options = item.options || []
          customFormContent += `
    <div class="form-group">
      <label for="${fieldId}">${escapeHTML(item.label)}${requiredMark}</label>
      <select id="${fieldId}" name="${escapeAttr(item.id)}" ${requiredAttr}>
        <option value="">请选择</option>
        ${options.map(opt => `<option value="${escapeAttr(opt.value || opt)}">${escapeHTML(opt.label || opt.value || opt)}</option>`).join('')}
      </select>
    </div>`
        } else if (item.type === 'checkbox') {
          customFormContent += `
    <div class="form-group form-checkbox">
      <label><input type="checkbox" name="${escapeAttr(item.id)}" ${requiredAttr}> ${escapeHTML(item.label)}</label>
    </div>`
        } else if (item.type === 'radio') {
          const options = item.options || []
          customFormContent += `
    <div class="form-group">
      <label>${escapeHTML(item.label)}${requiredMark}</label>
      <div class="radio-group">
        ${options.map(opt => `
          <label class="radio-label">
            <input type="radio" name="${escapeAttr(item.id)}" value="${escapeAttr(opt.value || opt)}" ${requiredAttr}>
            ${escapeHTML(opt.label || opt.value || opt)}
          </label>
        `).join('')}
      </div>
    </div>`
        } else if (item.type === 'description') {
          const textColor = item.color || '#333333'
          const fontSize = item.fontSize || 14
          const textAlign = item.textAlign || 'left'
          const bgColor = item.bgColor || '#f5f5f5'
          customFormContent += `
    <div class="form-description" style="color: ${textColor}; font-size: ${fontSize}px; text-align: ${textAlign}; background-color: ${bgColor};">
      <p>${escapeHTML(item.label || '')}</p>
    </div>`
        }
      })
      
      customFormContent += `
    <div class="form-group">
      <button type="submit" class="btn-primary">${escapeHTML(customSubmitText)}</button>
    </div>`
      
      return {
        tag: 'form',
        content: customFormContent,
        style: inlineStyle,
        attrs: `id="${customFormId}" action="${escapeAttr(customApiUrl)}" method="${escapeAttr(customApiMethod)}"`
      }

    case 'link':
      return {
        tag: 'a',
        content: escapeHTML(props.content || '链接'),
        style: inlineStyle + '; text-decoration: none;',
        attrs: `href="${escapeAttr(props.href || '#')}"`
      }

    case 'datetime':
      const displayType = props.displayType || 'datetime'
      const styleType = props.styleType || 'digital'
      const showWeek = props.showWeek || false
      const showAmPm = props.showAmPm || false
      const showSeconds = props.showSeconds !== false
      const datetimeId = `datetime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const datetimeIdClean = datetimeId.replace(/-/g, '')
      
      // 生成实时更新的JavaScript代码（压缩成单行避免裸换行）
      const datetimeScript = `function updateDatetime${datetimeIdClean}(){var now=new Date();var year=now.getFullYear();var month=String(now.getMonth()+1).padStart(2,'0');var day=String(now.getDate()).padStart(2,'0');var hours=now.getHours();var minutes=String(now.getMinutes()).padStart(2,'0');var seconds=String(now.getSeconds()).padStart(2,'0');var weekDays=['周日','周一','周二','周三','周四','周五','周六'];var week=weekDays[now.getDay()];var dateTimeText='';var displayType='${displayType}';var styleType='${styleType}';function padZero(n){return String(n).padStart(2,'0')}function getAmPm(h){return h>=12?'下午':'上午'}function get12Hours(h){var h12=h%12;return h12===0?12:h12}if(styleType==='traditional'){if(displayType==='date'||displayType==='datetime'){dateTimeText=year+'年'+(now.getMonth()+1)+'月'+day+'日';if(displayType==='datetime'){if(${showAmPm}){dateTimeText+=' '+getAmPm(hours)+' '+get12Hours(hours)+'点'+minutes+'分'}else{dateTimeText+=' '+hours+'时'+minutes+'分';if(${showSeconds})dateTimeText+=seconds+'秒'}}}else{if(${showAmPm}){dateTimeText=getAmPm(hours)+' '+get12Hours(hours)+':'+minutes}else{dateTimeText=hours+':'+minutes;if(${showSeconds})dateTimeText+=':'+seconds}}}else if(styleType==='compact'){if(displayType==='date'||displayType==='datetime'){dateTimeText=month+'/'+day;if(displayType==='datetime')dateTimeText+=' '+padZero(hours)+':'+minutes}else{dateTimeText=padZero(hours)+':'+minutes}}else{if(displayType==='date'||displayType==='datetime'){dateTimeText=year+'-'+month+'-'+day;if(displayType==='datetime'){if(${showAmPm}){dateTimeText+=' '+getAmPm(hours)+' '+get12Hours(hours)+':'+minutes}else{dateTimeText+=' '+padZero(hours)+':'+minutes;if(${showSeconds})dateTimeText+=':'+seconds}}else{if(${showAmPm}){dateTimeText=getAmPm(hours)+' '+get12Hours(hours)+':'+minutes}else{dateTimeText=padZero(hours)+':'+minutes;if(${showSeconds})dateTimeText+=':'+seconds}}}if(${showWeek})dateTimeText+=' '+week;document.getElementById('${datetimeId}').textContent=dateTimeText}updateDatetime${datetimeIdClean}();setInterval(updateDatetime${datetimeIdClean},1000)`
      
      return {
        tag: 'div',
        content: '',
        style: inlineStyle,
        attrs: `class="datetime-widget datetime-${styleType}" id="${datetimeId}"`,
        script: datetimeScript
      }

    // 导航组件
    case 'navMenu':
      const navLogo = props.logo || 'Logo'
      const navLogoUrl = props.logoUrl || '#'
      const navMenuItems = props.menuItems || '首页|#'
      const navActiveIndex = props.activeIndex || 0
      
      // 获取配置的颜色，使用默认值作为后备
      const navTextColor = style.color || '#333333'
      const navActiveColor = style.activeColor || '#1890ff'
      
      let navMenuContent = `
    <a href="${escapeAttr(navLogoUrl)}" class="nav-logo" style="color: ${navActiveColor};">${escapeHTML(navLogo)}</a>
    <div class="nav-items">`
      
      const navItems = navMenuItems.split('\n').filter(item => item.trim())
      navItems.forEach((item, index) => {
        const [text, url] = item.split('|')
        const itemUrl = url?.trim() || '#'
        const itemText = text?.trim() || '菜单项'
        const isActive = index === navActiveIndex
        const itemColor = isActive ? navActiveColor : navTextColor
        const itemBgColor = isActive ? `${navActiveColor}15` : 'transparent'
        navMenuContent += `
      <a href="${escapeAttr(itemUrl)}" class="nav-item${isActive ? ' active' : ''}" style="color: ${itemColor}; background-color: ${itemBgColor};">${escapeHTML(itemText)}</a>`
      })
      
      navMenuContent += `
    </div>`
      
      return {
        tag: 'nav',
        content: navMenuContent,
        style: inlineStyle,
        attrs: `class="nav-menu-widget"`
      }

    case 'breadcrumb':
      const breadcrumbItems = props.items || '首页|#'
      const breadcrumbSeparator = props.separator || '/'
      const breadcrumbShowHome = props.showHome !== false
      const breadcrumbHomeText = props.homeText || '首页'
      const breadcrumbTextColor = style.color || '#666666'
      const breadcrumbSeparatorColor = style.separatorColor || '#999999'
      const breadcrumbTarget = props.target || '_self'
      
      let breadcrumbContent = ''
      const breadcrumbItemsList = breadcrumbItems.split('\n').filter(item => item.trim())
      
      breadcrumbItemsList.forEach((item, index) => {
        const [text, url] = item.split('|')
        const itemUrl = url?.trim() || '#'
        const itemText = text?.trim() || '导航项'
        
        if (index > 0) {
          breadcrumbContent += `
      <span class="breadcrumb-separator" style="color: ${breadcrumbSeparatorColor}">${escapeHTML(breadcrumbSeparator)}</span>`
        }
        
        breadcrumbContent += `
      <a href="${escapeAttr(itemUrl)}" class="breadcrumb-link" style="color: ${breadcrumbTextColor}" target="${escapeAttr(breadcrumbTarget)}">${escapeHTML(itemText)}</a>`
      })
      
      return {
        tag: 'div',
        content: breadcrumbContent,
        style: inlineStyle,
        attrs: `class="breadcrumb-widget"`
      }

    case 'tabs':
      const tabItems = props.tabs || '标签一|tab1\n标签二|tab2\n标签三|tab3'
      const tabActiveTab = props.activeTab || 'tab1'
      const tabType = props.type || 'line'
      const tabContents = props.tabContents || {}

      // 确保tabItems是字符串
      const tabItemsStr = typeof tabItems === 'string' ? tabItems : '标签一|tab1\n标签二|tab2\n标签三|tab3'

      let tabsContent = `
    <div class="tabs-header${tabType === 'card' ? ' tabs-header-card' : ''}">`

      const tabItemsList = tabItemsStr.split('\n').filter(item => item.trim())
      tabItemsList.forEach((item, index) => {
        const parts = item.split('|')
        const text = (parts[0] || '').trim()
        const key = (parts[1] || text).trim()
        const tabKey = key || `tab${index + 1}`
        const tabText = text || `标签${index + 1}`
        const isActive = tabKey === tabActiveTab

        tabsContent += `
      <div class="tab-item${isActive ? ' active' : ''}" data-tab="${escapeHTML(tabKey)}">${escapeHTML(tabText)}</div>`
      })

      tabsContent += `
    </div>
    <div class="tabs-content">`

      tabItemsList.forEach((item, index) => {
        const parts = item.split('|')
        const text = (parts[0] || '').trim()
        const key = (parts[1] || text).trim()
        const tabKey = key || `tab${index + 1}`
        const tabText = text || `标签${index + 1}`
        const isActive = tabKey === tabActiveTab
        const tabContent = tabContents[tabKey] || tabContents[text] || `${tabText}的内容`
        const tabImages = props.tabImages || {}
        const imageConfig = tabImages[tabKey] || {}
        const imageUrl = imageConfig.url || ''
        const imageWidth = imageConfig.width || ''
        const imageHeight = imageConfig.height || ''
        const imageBorderRadius = imageConfig.borderRadius || ''

        // 如果是本地图片，使用导出时的路径
        let finalImageUrl = imageUrl
        if (imageConfig.isLocalImage && imagePaths[`${component.id}_${tabKey}`]) {
          finalImageUrl = imagePaths[`${component.id}_${tabKey}`]
        }

        let imageHtml = ''
        if (finalImageUrl) {
          imageHtml = `<img src="${escapeHTML(finalImageUrl)}" style="width: ${imageWidth || '100%'}; height: ${imageHeight || 'auto'}; border-radius: ${imageBorderRadius || '0'}; display: block; margin-bottom: 15px;" alt="" />`
        }

        tabsContent += `
      <div class="tab-pane${isActive ? ' active' : ''}" data-tab="${escapeHTML(tabKey)}">
        <div style="padding: 20px; color: #666666; white-space: pre-wrap;">${imageHtml}${tabContent}</div>
      </div>`
      })

      tabsContent += `
    </div>`

      return {
        tag: 'div',
        content: tabsContent,
        style: inlineStyle,
        attrs: `class="tabs-widget tabs-${tabType}"`
      }

    default:
      return {
        tag: 'div',
        content: '',
        style: inlineStyle,
        attrs: ''
      }
  }
}

/**
 * 生成单个组件的 HTML（递归处理嵌套组件）
 * @param {Object} component - 组件数据
 * @param {Object} imagePaths - 图片路径映射
 * @param {Array} allComponents - 所有组件（用于查找子组件）
 * @param {number} indent - 缩进级别
 * @returns {string}
 */
export function generateComponentHTML(component, imagePaths = {}, allComponents = [], indent = 4, pageWidth = 1200, pageHeight = 800) {
  const { tag, content, attrs, script } = getComponentTag(component, imagePaths, pageWidth, pageHeight)
  
  // 使用CSS类代替内联样式，提高可读性
  const className = generateComponentId(component)
  let attrsStr = attrs || ''
  
  // 添加组件类名
  if (attrsStr.includes('class=')) {
    attrsStr = attrsStr.replace(/class="([^"]+)"/, `class="$1 ${className}"`)
  } else {
    attrsStr = `class="${className}"${attrsStr ? ' ' + attrsStr : ''}`
  }

  // 自闭合标签
  const selfClosingTags = ['img', 'hr', 'br', 'input']

  if (selfClosingTags.includes(tag)) {
    return {
      html: ' '.repeat(indent) + `<${tag}${attrsStr ? ' ' + attrsStr : ''}>`,
      script
    }
  }

  // 获取容器的子组件
  let childrenHTML = ''
  let childrenScript = []
  if (component.type === 'container' && allComponents.length > 0) {
    const children = allComponents.filter(c => c.parentId === component.id)
    if (children.length > 0) {
      const childrenResults = children.map(child => 
        generateComponentHTML(child, imagePaths, allComponents, indent + 4, pageWidth, pageHeight)
      )
      childrenHTML = '\n' + childrenResults.map(r => r.html || r).join('\n') + '\n' + ' '.repeat(indent)
      childrenScript = childrenResults.flatMap(r => r.script ? [r.script] : [])
    }
  }

  // 根据内容长度决定是否换行
  const contentLines = content.split('\n').filter(line => line.trim())
  let html
  if (contentLines.length > 1 || content.length > 50) {
    // 多行内容，单独占行
    html = ' '.repeat(indent) + `<${tag}${attrsStr ? ' ' + attrsStr : ''}>\n${content}${childrenHTML}\n` + ' '.repeat(indent) + `</${tag}>`
  } else {
    html = ' '.repeat(indent) + `<${tag}${attrsStr ? ' ' + attrsStr : ''}>${content}${childrenHTML}</${tag}>`
  }
  
  return {
    html,
    script: script || (childrenScript.length > 0 ? childrenScript : null)
  }
}

/**
 * 生成组件的CSS样式（用于完整页面）
 * @param {Object} component - 组件数据
 * @param {number} pageWidth - 页面宽度
 * @param {number} pageHeight - 页面高度
 * @returns {string}
 */
function generateComponentCSS(component, pageWidth, pageHeight) {
  return componentStyleToCSSClass(component, pageWidth, pageHeight)
}

/**
 * 生成完整页面的 HTML（可读性优化版）
 * @param {Object} pageData - 页面数据
 * @param {Object} imagePaths - 图片路径映射
 * @returns {string}
 */
export function generatePageHTML(pageData, imagePaths = {}) {
  const { width = 1200, height = 800, backgroundColor = '#ffffff', components = [] } = pageData

  // 只获取顶层组件（没有父容器的组件）
  const topLevelComponents = components.filter(comp => !comp.parentId)

  // 收集所有datetime组件的脚本
  const datetimeScripts = []
  
  // 生成组件HTML
  const componentsHTML = topLevelComponents.map(comp => {
    const result = generateComponentHTML(comp, imagePaths, components, 4, width, height)
    // 如果是datetime组件，收集脚本
    if (comp.type === 'datetime' && result.script) {
      datetimeScripts.push(result.script)
    }
    return result.html || result
  }).join('\n')

  // 生成组件CSS
  const componentsCSS = components.map(comp => {
    return generateComponentCSS(comp, width, height)
  }).join('\n\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.name || '未命名页面'}</title>
  <style>
    /**
     * 全局样式重置
     */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      min-height: 100%;
      overflow-x: hidden;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background-color: #fff;
    }

    /**
     * 页面容器 - 固定宽度，支持滚动查看长页面
     */
    .page-container {
      width: ${width}px;
      min-height: ${height}px;
      background-color: ${backgroundColor};
      position: relative;
      margin: 0 auto;
    }

    /**
     * 按钮样式
     */
    .page-container button {
      border: none;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .page-container button:hover {
      opacity: 0.9;
    }

    /**
     * 链接样式
     */
    .page-container a {
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .page-container a:hover {
      opacity: 0.8;
    }

    /**
     * 日期时间组件样式
     */
    .page-container .datetime-widget {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      user-select: none;
    }

    .page-container .datetime-widget.datetime-digital {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .page-container .datetime-widget.datetime-traditional {
      font-family: 'Georgia', serif;
    }

    .page-container .datetime-widget.datetime-compact {
      font-size: 0.9em;
    }

    /**
     * 表单样式
     */
    .page-container .form-group {
      margin-bottom: 16px;
    }

    .page-container .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .page-container .form-group input,
    .page-container .form-group textarea,
    .page-container .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    .page-container .form-group input:focus,
    .page-container .form-group textarea:focus,
    .page-container .form-group select:focus {
      outline: none;
      border-color: #1890ff;
    }

    .page-container .form-group textarea {
      resize: vertical;
    }

    .page-container .btn-primary {
      width: 100%;
      padding: 10px;
      background-color: #1890ff;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }

    .page-container .btn-primary:hover {
      background-color: #40a9ff;
    }

    .page-container .form-title {
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
    }

    .page-container .form-checkbox {
      margin-bottom: 16px;
    }

    .page-container .form-checkbox label {
      font-weight: normal;
      cursor: pointer;
    }

    .page-container .form-description {
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 4px;
      line-height: 1.6;
    }

    .page-container .form-links {
      text-align: center;
      margin-top: 16px;
    }

    /**
     * 导航菜单样式
     */
    .page-container .nav-menu-widget {
      display: flex;
      align-items: center;
    }

    .page-container .nav-menu-widget .nav-logo {
      font-size: 20px;
      font-weight: bold;
      color: #1890ff;
      text-decoration: none;
      margin-right: 40px;
    }

    .page-container .nav-menu-widget .nav-items {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-container .nav-menu-widget .nav-item {
      padding: 8px 16px;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s;
      font-size: 14px;
    }

    .page-container .nav-menu-widget .nav-item:hover {
      color: #1890ff;
      background-color: rgba(24, 144, 255, 0.1);
    }

    .page-container .nav-menu-widget .nav-item.active {
      color: #1890ff;
      background-color: rgba(24, 144, 255, 0.1);
      font-weight: 500;
    }

    /**
     * 面包屑样式
     */
    .page-container .breadcrumb-widget {
      display: flex;
      align-items: center;
    }

    .page-container .breadcrumb-widget .breadcrumb-link {
      text-decoration: none;
      transition: color 0.3s;
    }

    .page-container .breadcrumb-widget .breadcrumb-link:hover {
      color: #1890ff;
    }

    .page-container .breadcrumb-widget .breadcrumb-separator {
      margin: 0 8px;
    }

    /**
     * 标签页样式
     */
    .page-container .tabs-widget {
      display: flex;
      flex-direction: column;
      border-radius: 4px;
      overflow: hidden;
    }

    .page-container .tabs-widget .tabs-header {
      display: flex;
      background-color: #fafafa;
    }

    .page-container .tabs-widget .tab-item {
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      color: #666666;
    }

    .page-container .tabs-widget .tab-item:hover {
      color: #1890ff;
    }

    .page-container .tabs-widget .tab-item.active {
      font-weight: 500;
      color: #1890ff;
      border-bottom-color: #1890ff;
    }

    .page-container .tabs-widget .tabs-content {
      flex: 1;
      overflow: hidden;
    }

    .page-container .tabs-widget .tab-pane {
      display: none;
      height: 100%;
      overflow: auto;
    }

    .page-container .tabs-widget .tab-pane.active {
      display: block;
    }

    /**
     * 容器组件样式
     */
    .page-container .container {
      overflow: hidden;
    }

    /**
     * 组件样式定义
     */
${componentsCSS}
  </style>
</head>
<body>
  <div class="page-container">
${componentsHTML}
  </div>
  <script>
    function navigateTo(url, target) {
      if (url && url !== '#') {
        window.open(url, target);
      }
    }

    function showAlert(message) {
      alert(message);
    }

    async function callAPI(url, method, bodyStr) {
      if (!url) {
        alert('请配置 API 地址');
        return;
      }
      try {
        const body = bodyStr ? JSON.parse(bodyStr) : undefined;
        const response = await fetch(url, {
          method: method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        const result = await response.json();
        alert('API 调用成功!\\n' + JSON.stringify(result));
      } catch (error) {
        alert('API 调用失败: ' + error.message);
      }
    }

    async function callAPIFromData(btn, url, method, encodedBody) {
      if (!url) {
        alert('请配置 API 地址');
        return;
      }
      try {
        const bodyStr = encodedBody ? decodeURIComponent(encodedBody) : '{}';
        const body = JSON.parse(bodyStr);
        const response = await fetch(url, {
          method: method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
        });
        const result = await response.json();
        alert('API 调用成功!\\n' + JSON.stringify(result));
      } catch (error) {
        alert('API 调用失败: ' + error.message);
      }
    }

    function submitForm() {
      alert('表单提交功能（预留）');
    }

    (function() {
      if (window.__tabsInitialized) return;
      window.__tabsInitialized = true;

      function initTabs() {
        var tabsWidgets = document.querySelectorAll('.tabs-widget');
        tabsWidgets.forEach(function(widget) {
          if (widget.__tabsReady) return;
          widget.__tabsReady = true;

          var tabItems = widget.querySelectorAll('.tab-item');
          var tabPanes = widget.querySelectorAll('.tab-pane');

          tabItems.forEach(function(item) {
            item.addEventListener('click', function() {
              var tabKey = this.getAttribute('data-tab');
              tabItems.forEach(function(t) {
                t.classList.remove('active');
              });
              this.classList.add('active');
              tabPanes.forEach(function(pane) {
                if (pane.getAttribute('data-tab') === tabKey) {
                  pane.classList.add('active');
                } else {
                  pane.classList.remove('active');
                }
              });
            });
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
      } else {
        initTabs();
      }
    })();
  <\/script>
  ${datetimeScripts.length > 0 ? `<script>${datetimeScripts.join('')}<\/script>` : ''}
</body>
</html>`
}

/**
 * 下载 HTML 文件（仅 HTML，不含本地图片）
 * @param {string} html - HTML 内容
 * @param {string} filename - 文件名
 */
export function downloadHTML(html, filename = 'page.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出页面（HTML + 本地图片打包为 ZIP）
 * @param {Object} pageData - 页面数据
 * @param {string} filename - 文件名（不含扩展名）
 */
export async function exportPageWithImages(pageData, filename = 'page') {
  const zip = new JSZip()

  // 收集本地图片
  const localImages = []
  const imagePaths = {}

  pageData.components.forEach((comp, index) => {
    // 处理图片组件的本地图片
    if (comp.type === 'image' && comp.props?.localImage && comp.props?.src) {
      const imageData = extractBase64Image(comp.props.src)
      if (imageData) {
        const originalName = comp.props.imageFileName || `image_${index}`
        const safeName = originalName.replace(/[^a-zA-Z0-9_\-.]/g, '_')
        const imageFileName = `images/${safeName}.${imageData.extension}`

        localImages.push({
          filename: imageFileName,
          data: imageData.data
        })

        imagePaths[comp.id] = imageFileName
      }
    }

    // 处理标签页组件的本地图片
    if (comp.type === 'tabs' && comp.props?.tabImages) {
      const tabImages = comp.props.tabImages
      Object.keys(tabImages).forEach((tabKey, tabIndex) => {
        const imageConfig = tabImages[tabKey]
        if (imageConfig.isLocalImage && imageConfig.url) {
          const imageData = extractBase64Image(imageConfig.url)
          if (imageData) {
            const originalName = imageConfig.fileName || `tab_image_${index}_${tabIndex}`
            const safeName = originalName.replace(/[^a-zA-Z0-9_\-.]/g, '_')
            const imageFileName = `images/${safeName}.${imageData.extension}`

            localImages.push({
              filename: imageFileName,
              data: imageData.data
            })

            // 使用组件ID + tabKey作为唯一标识
            imagePaths[`${comp.id}_${tabKey}`] = imageFileName
          }
        }
      })
    }
  })

  // 添加图片到 ZIP
  if (localImages.length > 0) {
    const imagesFolder = zip.folder('images')
    localImages.forEach(img => {
      imagesFolder.file(img.filename.replace('images/', ''), img.data)
    })
  }

  // 生成 HTML（使用新图片路径）
  const html = generatePageHTML(pageData, imagePaths)
  zip.file(`${filename}.html`, html)

  // 生成并下载 ZIP
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${filename}.zip`)
}

/**
 * 检查页面是否包含本地图片
 * @param {Object} pageData - 页面数据
 * @returns {boolean}
 */
export function hasLocalImages(pageData) {
  return pageData.components.some(comp => {
    // 检查图片组件
    if (comp.type === 'image' && comp.props?.localImage) {
      return true
    }
    // 检查标签页组件
    if (comp.type === 'tabs' && comp.props?.tabImages) {
      return Object.values(comp.props.tabImages).some(img => img.isLocalImage)
    }
    return false
  })
}

/**
 * 生成自定义表单的后端代码（Node.js + Express）
 * @param {Object} formComponent - 表单组件数据
 * @returns {string} - 后端代码字符串
 */
export function generateBackendCode(formComponent) {
  const props = formComponent.props || {}
  const formItems = props.formItems || []
  const apiUrl = props.apiUrl || '/api/submit-form'
  const apiMethod = (props.apiMethod || 'POST').toUpperCase()
  
  // 生成字段验证规则
  const validationRules = formItems.map(item => {
    // 跳过文本描述类型
    if (item.type === 'description') {
      return ''
    }
    
    const fieldName = item.id
    const fieldLabel = item.label
    const required = item.required
    const fieldType = item.type
    
    let rules = []
    
    if (required) {
      rules.push(`  // ${fieldLabel} 必填验证`)
      rules.push(`  if (!req.body.${fieldName} || req.body.${fieldName}.trim() === '') {`)
      rules.push(`    return res.status(400).json({ success: false, message: '请填写${fieldLabel}' })`)
      rules.push(`  }`)
    }
    
    if (fieldType === 'email' && required) {
      rules.push(`  // ${fieldLabel} 邮箱格式验证`)
      rules.push(`  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`)
      rules.push(`  if (!emailRegex.test(req.body.${fieldName})) {`)
      rules.push(`    return res.status(400).json({ success: false, message: '${fieldLabel}格式不正确' })`)
      rules.push(`  }`)
    }
    
    if (fieldType === 'tel' && required) {
      rules.push(`  // ${fieldLabel} 手机号格式验证`)
      rules.push(`  const phoneRegex = /^1[3-9]\\d{9}$/`)
      rules.push(`  if (!phoneRegex.test(req.body.${fieldName})) {`)
      rules.push(`    return res.status(400).json({ success: false, message: '${fieldLabel}格式不正确' })`)
      rules.push(`  }`)
    }
    
    return rules.join('\n')
  }).join('\n\n')
  
  // 生成表单字段列表（用于日志和数据库存储）
  const fieldList = formItems
    .filter(item => item.type !== 'description')
    .map(item => `    ${item.id}: req.body.${item.id}`)
    .join(',\n')
  
  const backendCode = `// ============================================
// 自定义表单后端 API - Node.js + Express
// ============================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ${apiMethod} ${apiUrl} - 处理表单提交
app.${apiMethod.toLowerCase()}('${apiUrl}', (req, res) => {
  try {
${validationRules}

    // 获取表单数据
    const formData = {
${fieldList}
    };

    // 打印接收到的表单数据（生产环境应记录到日志系统）
    console.log('收到表单提交:', JSON.stringify(formData, null, 2));

    // TODO: 在这里添加业务逻辑
    // 1. 将数据保存到数据库（如 MongoDB、MySQL 等）
    // 2. 发送邮件通知
    // 3. 调用其他 API 等

    // 模拟保存成功（生产环境应替换为真实数据库操作）
    setTimeout(() => {
      res.json({
        success: true,
        message: '表单提交成功！',
        data: formData
      });
    }, 500);

  } catch (error) {
    console.error('表单处理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(\`服务器运行在 http://localhost:\${PORT}\`);
  console.log(\`表单提交接口: ${apiMethod} http://localhost:${PORT}${apiUrl}\`);
});

// ============================================
// 使用说明：
// ============================================
// 1. 安装依赖：npm install express body-parser cors
// 2. 创建文件：将此代码保存为 server.js
// 3. 启动服务：node server.js
// 4. 配置前端表单的 action 属性为：http://localhost:3000${apiUrl}

// ============================================
// 可选：使用 MongoDB 存储示例
// ============================================
/*
const mongoose = require('mongoose');

// 连接 MongoDB
mongoose.connect('mongodb://localhost:27017/forms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 定义表单数据模型
const FormDataSchema = new mongoose.Schema({
${formItems.filter(item => item.type !== 'description').map(item => `  ${item.id}: { type: String${item.required ? ', required: true' : ''} }`).join(',\n')}
}, { timestamps: true });

const FormData = mongoose.model('FormData', FormDataSchema);

// 在 API 中使用模型保存数据
// const savedData = await FormData.create(formData);
*/
`
  
  return backendCode
}

/**
 * 下载后端代码文件
 * @param {string} code - 代码内容
 * @param {string} filename - 文件名
 */
export function downloadBackendCode(code, filename = 'server.js') {
  const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
