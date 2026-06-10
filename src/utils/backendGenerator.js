/**
 * 后端代码生成器
 * 根据组件配置生成对应的后端代码片段
 * 支持多种后端框架：Spring Boot、Node.js (Express)、Python (Flask)
 */

// 后端框架类型
export const BACKEND_FRAMEWORKS = {
  SPRING_BOOT: 'springboot',
  EXPRESS: 'express',
  FLASK: 'flask'
}

// 生成类型
export const GENERATE_TYPES = {
  ENTITY: 'entity',           // 实体类/模型
  ABSTRACT: 'abstract',       // 抽象类
  INTERFACE: 'interface',     // 接口
  UTIL: 'util',               // 工具类
  CONTROLLER: 'controller'    // API控制器
}

// 组件到后端实体的映射配置
const COMPONENT_BACKEND_CONFIG = {
  text: {
    type: 'text',
    field: 'textContent',
    className: 'TextComponent',
    tableName: 'text_components',
    description: '文本组件',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: false,
    validation: {
      springboot: '@NotBlank(message = "文本内容不能为空")',
      express: 'notEmpty().withMessage("文本内容不能为空")',
      flask: 'required()'
    },
    fields: {
      springboot: ['private String content;', 'private String textAlign;'],
      express: ['content: { type: String, required: true }', 'textAlign: { type: String, enum: ["left", "center", "right", "justify"] }'],
      flask: ['content = db.Column(db.Text, nullable=False)', 'text_align = db.Column(db.String(20))']
    }
  },
  image: {
    type: 'image',
    field: 'imageUrl',
    className: 'ImageComponent',
    tableName: 'image_components',
    description: '图片组件',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: true,
    validation: {
      springboot: '@NotBlank(message = "图片 URL 不能为空")',
      express: 'notEmpty().withMessage("图片 URL 不能为空")',
      flask: 'required()'
    },
    fields: {
      springboot: ['private String src;', 'private String alt;', 'private String objectFit;'],
      express: ['src: { type: String, required: true }', 'alt: String', 'objectFit: { type: String, enum: ["cover", "contain", "fill", "none", "scale-down"] }'],
      flask: ['src = db.Column(db.String(1000), nullable=False)', 'alt = db.Column(db.String(200))', 'object_fit = db.Column(db.String(20))']
    }
  },
  button: {
    type: 'action',
    field: 'buttonConfig',
    className: 'ButtonComponent',
    tableName: 'button_components',
    description: '按钮组件',
    hasAbstract: true,
    hasInterface: true,
    hasUtil: false,
    actions: ['link', 'submit', 'api'],
    fields: {
      springboot: [
        'private String content;',
        'private String actionType; // link, alert, api, submit',
        'private String href;',
        'private String apiUrl;',
        'private String apiMethod;',
        'private String alertMessage;'
      ],
      express: [
        'content: { type: String, required: true }',
        'actionType: { type: String, enum: ["link", "alert", "api", "submit"] }',
        'href: String',
        'apiUrl: String',
        'apiMethod: { type: String, enum: ["GET", "POST", "PUT", "DELETE"] }',
        'alertMessage: String'
      ],
      flask: [
        'content = db.Column(db.String(200), nullable=False)',
        'action_type = db.Column(db.String(20))',
        'href = db.Column(db.String(500))',
        'api_url = db.Column(db.String(500))',
        'api_method = db.Column(db.String(10))',
        'alert_message = db.Column(db.Text)'
      ]
    }
  },
  container: {
    type: 'container',
    field: 'containerConfig',
    className: 'ContainerComponent',
    tableName: 'container_components',
    description: '容器组件',
    hasAbstract: true,
    hasInterface: false,
    hasUtil: false,
    fields: {
      springboot: ['private String backgroundColor;', 'private Integer padding;'],
      express: ['backgroundColor: String', 'padding: Number'],
      flask: ['background_color = db.Column(db.String(20))', 'padding = db.Column(db.Integer)']
    }
  },
  link: {
    type: 'link',
    field: 'linkConfig',
    className: 'LinkComponent',
    tableName: 'link_components',
    description: '链接组件',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: false,
    validation: {
      springboot: `@NotBlank(message = "链接地址不能为空")\n  @Pattern(regexp = "^https?://.*", message = "链接格式不正确")`,
      express: 'notEmpty().withMessage("链接地址不能为空").matches(/^https?:\\/\\/.*/).withMessage("链接格式不正确")',
      flask: 'required(), url()'
    },
    fields: {
      springboot: ['private String content;', 'private String href;'],
      express: ['content: { type: String, required: true }', 'href: { type: String, required: true }'],
      flask: ['content = db.Column(db.String(200), nullable=False)', 'href = db.Column(db.String(1000), nullable=False)']
    }
  },
  // 预设表单组件
  loginForm: {
    type: 'form',
    className: 'LoginRequest',
    tableName: 'login_requests',
    description: '登录表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: true,
    fields: {
      springboot: [
        'private String username;',
        'private String password;',
        'private Boolean remember;'
      ],
      express: [
        'username: { type: String, required: true }',
        'password: { type: String, required: true }',
        'remember: { type: Boolean, default: false }'
      ],
      flask: [
        'username = db.Column(db.String(50), nullable=False)',
        'password = db.Column(db.String(255), nullable=False)',
        'remember = db.Column(db.Boolean, default=False)'
      ]
    }
  },
  registerForm: {
    type: 'form',
    className: 'RegisterRequest',
    tableName: 'register_requests',
    description: '注册表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: true,
    fields: {
      springboot: [
        'private String username;',
        'private String email;',
        'private String password;',
        'private String confirmPassword;',
        'private Boolean agreement;'
      ],
      express: [
        'username: { type: String, required: true }',
        'email: { type: String, required: true }',
        'password: { type: String, required: true }',
        'confirmPassword: { type: String, required: true }',
        'agreement: { type: Boolean, required: true }'
      ],
      flask: [
        'username = db.Column(db.String(50), nullable=False)',
        'email = db.Column(db.String(100), nullable=False)',
        'password = db.Column(db.String(255), nullable=False)',
        'confirm_password = db.Column(db.String(255), nullable=False)',
        'agreement = db.Column(db.Boolean, nullable=False)'
      ]
    }
  },
  contactForm: {
    type: 'form',
    className: 'ContactRequest',
    tableName: 'contact_requests',
    description: '联系表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: false,
    fields: {
      springboot: [
        'private String name;',
        'private String email;',
        'private String phone;',
        'private String subject;',
        'private String message;'
      ],
      express: [
        'name: { type: String, required: true }',
        'email: { type: String, required: true }',
        'phone: String',
        'subject: { type: String, required: true }',
        'message: { type: String, required: true }'
      ],
      flask: [
        'name = db.Column(db.String(100), nullable=False)',
        'email = db.Column(db.String(100), nullable=False)',
        'phone = db.Column(db.String(20))',
        'subject = db.Column(db.String(200), nullable=False)',
        'message = db.Column(db.Text, nullable=False)'
      ]
    }
  },
  searchForm: {
    type: 'form',
    className: 'SearchRequest',
    tableName: 'search_requests',
    description: '搜索表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: true,
    fields: {
      springboot: [
        'private String keyword;',
        'private String category;'
      ],
      express: [
        'keyword: { type: String, required: true }',
        'category: String'
      ],
      flask: [
        'keyword = db.Column(db.String(200), nullable=False)',
        'category = db.Column(db.String(50))'
      ]
    }
  },
  commentForm: {
    type: 'form',
    className: 'CommentRequest',
    tableName: 'comments',
    description: '评论表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: false,
    fields: {
      springboot: [
        'private Integer rating;',
        'private String author;',
        'private String email;',
        'private String content;'
      ],
      express: [
        'rating: { type: Number, min: 1, max: 5 }',
        'author: { type: String, required: true }',
        'email: String',
        'content: { type: String, required: true }'
      ],
      flask: [
        'rating = db.Column(db.Integer)',
        'author = db.Column(db.String(100), nullable=False)',
        'email = db.Column(db.String(100))',
        'content = db.Column(db.Text, nullable=False)'
      ]
    }
  },
  // 自定义表单
  customForm: {
    type: 'form',
    className: 'CustomFormRequest',
    tableName: 'custom_form_submissions',
    description: '自定义表单',
    hasAbstract: false,
    hasInterface: true,
    hasUtil: true,
    isDynamic: true // 标记为动态表单，需要根据表单字段生成
  }
}

/**
 * 生成实体类代码
 * @param {Array} components - 组件列表
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateEntityClass(components, className = 'PageComponent', framework = 'springboot') {
  const fields = new Set()
  const imports = new Set()
  
  // 收集所有字段和导入
  components.forEach(comp => {
    const config = COMPONENT_BACKEND_CONFIG[comp.type]
    if (!config) return
    
    if (config.type === 'text' || config.type === 'image') {
      fields.add(`  private String ${config.field};`)
      if (config.validation?.[framework]) {
        imports.add(config.validation[framework].split(' ')[0])
      }
    } else if (config.type === 'action') {
      fields.add(config.config?.[framework] || '')
    } else if (config.type === 'container') {
      fields.add(config.config?.[framework] || '')
    } else if (config.type === 'link') {
      fields.add(`  private String ${config.field};`)
      if (config.validation?.[framework]) {
        imports.add(config.validation[framework].split('\n')[0].trim())
      }
    }
  })
  
  // 根据框架生成代码
  if (framework === 'springboot') {
    return addReferenceComment(generateSpringBootEntity(className, Array.from(fields), Array.from(imports)), framework)
  } else if (framework === 'express') {
    return addReferenceComment(generateExpressSchema(className, Array.from(fields)), framework)
  } else if (framework === 'flask') {
    return addReferenceComment(generateFlaskModel(className, Array.from(fields)), framework)
  }
  
  return ''
}

/**
 * 生成抽象类代码
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateAbstractClass(className, framework = 'springboot') {
  if (framework === 'springboot') {
    return addReferenceComment(generateSpringBootAbstractClass(className), framework)
  } else if (framework === 'express') {
    return addReferenceComment(generateExpressAbstractClass(className), framework)
  } else if (framework === 'flask') {
    return addReferenceComment(generateFlaskAbstractClass(className), framework)
  }
  
  return ''
}

/**
 * 生成接口代码
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateInterface(className, framework = 'springboot') {
  if (framework === 'springboot') {
    return addReferenceComment(generateSpringBootInterface(className), framework)
  } else if (framework === 'express') {
    return addReferenceComment(generateExpressInterface(className), framework)
  } else if (framework === 'flask') {
    return addReferenceComment(generateFlaskInterface(className), framework)
  }
  
  return ''
}

/**
 * 生成工具类代码
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateUtilClass(className, framework = 'springboot') {
  if (framework === 'springboot') {
    return addReferenceComment(generateSpringBootUtilClass(className), framework)
  } else if (framework === 'express') {
    return addReferenceComment(generateExpressUtilClass(className), framework)
  } else if (framework === 'flask') {
    return addReferenceComment(generateFlaskUtilClass(className), framework)
  }
  
  return ''
}

/**
 * 在代码第一行添加"仅作参考"注释
 * @param {string} code - 代码内容
 * @param {string} framework - 后端框架
 * @returns {string}
 */
function addReferenceComment(code, framework) {
  if (!code) return ''
  
  let comment = ''
  switch (framework) {
    case 'springboot':
      comment = '// 仅作参考'
      break
    case 'express':
      comment = '// 仅作参考'
      break
    case 'flask':
      comment = '# 仅作参考'
      break
    default:
      comment = '// 仅作参考'
  }
  
  return `${comment}\n${code}`
}

/**
 * 一键生成所有后台代码
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {Object} - 包含所有代码的对象
 */
export function generateAllBackendCode(className, framework = 'springboot') {
  const config = COMPONENT_BACKEND_CONFIG[className.toLowerCase()] || { className }
  
  const result = {
    entity: null,
    abstract: null,
    interface: null,
    util: null,
    controller: null
  }
  
  // 生成实体类
  result.entity = {
    filename: getFilename(className, 'entity', framework),
    content: generateSingleComponentEntity({ type: className.toLowerCase() }, framework)
  }
  
  // 根据配置生成抽象类（如果需要）
  const compConfig = COMPONENT_BACKEND_CONFIG[className.toLowerCase()]
  if (compConfig?.hasAbstract !== false) {
    result.abstract = {
      filename: getFilename(className, 'abstract', framework),
      content: generateAbstractClass(className, framework)
    }
  }
  
  // 根据配置生成接口（如果需要）
  if (compConfig?.hasInterface !== false) {
    result.interface = {
      filename: getFilename(className, 'interface', framework),
      content: generateInterface(className, framework)
    }
  }
  
  // 根据配置生成工具类（如果需要）
  if (compConfig?.hasUtil !== false) {
    result.util = {
      filename: getFilename(className, 'util', framework),
      content: generateUtilClass(className, framework)
    }
  }
  
  // 生成控制器
  result.controller = {
    filename: getFilename(className, 'controller', framework),
    content: generateAPIController(className, framework)
  }
  
  return result
}

/**
 * 获取文件名
 * @param {string} className - 类名
 * @param {string} type - 类型 (entity/abstract/interface/util/controller)
 * @param {string} framework - 后端框架
 * @returns {string}
 */
function getFilename(className, type, framework) {
  const ext = framework === 'springboot' ? '.java' : framework === 'express' ? '.js' : '.py'
  
  switch (type) {
    case 'entity':
      return `${className}${ext}`
    case 'abstract':
      return `Abstract${className}${ext}`
    case 'interface':
      return framework === 'springboot' ? `I${className}Service${ext}` : `I${className}${ext}`
    case 'util':
      return `${className}Util${ext}`
    case 'controller':
      return framework === 'springboot' ? `${className}Controller${ext}` : 
             framework === 'express' ? `${className}Controller${ext}` : 
             `${className.toLowerCase()}_routes${ext}`
    default:
      return `${className}${ext}`
  }
}

/**
 * 生成 Spring Boot 实体类
 */
function generateSpringBootEntity(className, fields, imports) {
  const importStatements = [
    'import lombok.Data;',
    'import lombok.NoArgsConstructor;',
    'import javax.validation.constraints.*;',
    'import java.io.Serializable;',
    ...imports.map(imp => `import javax.validation.constraints.${imp.replace('@', '')};`)
  ].filter((v, i, a) => a.indexOf(v) === i).join('\n')
  
  return `
${importStatements}

/**
 * ${className} - 页面组件实体类
 * 自动生成于 ${new Date().toLocaleString()}
 */
@Data
@NoArgsConstructor
public class ${className} implements Serializable {
  
  private static final long serialVersionUID = 1L;
  
${fields.filter(f => f.trim()).join('\n')}
  
  // Getter 和 Setter 方法由 Lombok 自动生成
}
`.trim()
}

/**
 * 生成 Spring Boot 抽象类
 */
function generateSpringBootAbstractClass(className) {
  const abstractClassName = `Abstract${className}`
  
  return `
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ${abstractClassName} - 抽象基类
 * 自动生成于 ${new Date().toLocaleString()}
 */
@Data
@NoArgsConstructor
public abstract class ${abstractClassName} {
  
  /**
   * 创建时间
   */
  protected LocalDateTime createdAt;
  
  /**
   * 更新时间
   */
  protected LocalDateTime updatedAt;
  
  /**
   * 创建前的初始化操作
   */
  public abstract void beforeCreate();
  
  /**
   * 更新前的操作
   */
  public abstract void beforeUpdate();
  
  /**
   * 验证数据合法性
   * @return 是否验证通过
   */
  public abstract boolean validate();
}
`.trim()
}

/**
 * 生成 Spring Boot 接口
 */
function generateSpringBootInterface(className) {
  const interfaceName = `I${className}`
  
  return `
import java.util.List;
import java.util.Optional;

/**
 * ${interfaceName} - ${className} 服务接口
 * 自动生成于 ${new Date().toLocaleString()}
 */
public interface ${interfaceName}Service {
  
  /**
   * 获取所有${className}
   * @return ${className}列表
   */
  List<${className}> findAll();
  
  /**
   * 根据ID获取${className}
   * @param id 主键ID
   * @return ${className}对象（可选）
   */
  Optional<${className}> findById(Long id);
  
  /**
   * 保存${className}
   * @param ${className.charAt(0).toLowerCase() + className.slice(1)} ${className}对象
   * @return 保存后的${className}对象
   */
  ${className} save(${className} ${className.charAt(0).toLowerCase() + className.slice(1)});
  
  /**
   * 更新${className}
   * @param id 主键ID
   * @param ${className.charAt(0).toLowerCase() + className.slice(1)} 更新的${className}对象
   * @return 更新后的${className}对象
   */
  ${className} update(Long id, ${className} ${className.charAt(0).toLowerCase() + className.slice(1)});
  
  /**
   * 删除${className}
   * @param id 主键ID
   */
  void delete(Long id);
}
`.trim()
}

/**
 * 生成 Spring Boot 工具类
 */
function generateSpringBootUtilClass(className) {
  const utilClassName = `${className}Util`
  
  return `
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;

/**
 * ${utilClassName} - ${className} 工具类
 * 自动生成于 ${new Date().toLocaleString()}
 */
public final class ${utilClassName} {
  
  private static final ObjectMapper objectMapper;
  
  static {
    objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
  }
  
  private ${utilClassName}() {
    // 私有构造函数，防止实例化
  }
  
  /**
   * 将${className}对象转换为JSON字符串
   * @param ${className.charAt(0).toLowerCase() + className.slice(1)} ${className}对象
   * @return JSON字符串
   */
  public static String toJson(${className} ${className.charAt(0).toLowerCase() + className.slice(1)}) {
    try {
      return objectMapper.writeValueAsString(${className.charAt(0).toLowerCase() + className.slice(1)});
    } catch (IOException e) {
      throw new RuntimeException("转换JSON失败", e);
    }
  }
  
  /**
   * 将JSON字符串转换为${className}对象
   * @param json JSON字符串
   * @return ${className}对象
   */
  public static ${className} fromJson(String json) {
    try {
      return objectMapper.readValue(json, ${className}.class);
    } catch (IOException e) {
      throw new RuntimeException("解析JSON失败", e);
    }
  }
  
  /**
   * 验证${className}对象是否为空
   * @param ${className.charAt(0).toLowerCase() + className.slice(1)} ${className}对象
   * @return 是否为空
   */
  public static boolean isEmpty(${className} ${className.charAt(0).toLowerCase() + className.slice(1)}) {
    return ${className.charAt(0).toLowerCase() + className.slice(1)} == null;
  }
  
  /**
   * 复制${className}对象
   * @param source 源对象
   * @return 复制后的对象
   */
  public static ${className} copy(${className} source) {
    if (source == null) {
      return null;
    }
    String json = toJson(source);
    return fromJson(json);
  }
}
`.trim()
}

/**
 * 生成 Express/Mongoose Schema
 */
function generateExpressSchema(className, fields) {
  return `
const mongoose = require('mongoose');

/**
 * ${className} - 页面组件 Schema
 * 自动生成于 ${new Date().toLocaleString()}
 */
const ${className}Schema = new mongoose.Schema({
${fields.filter(f => f.trim()).join('\n').split('\n').map(line => '  ' + line).join('\n')}
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('${className}', ${className}Schema);
`.trim()
}

/**
 * 生成 Express 抽象类
 */
function generateExpressAbstractClass(className) {
  const abstractClassName = `Abstract${className}`
  
  return `
/**
 * ${abstractClassName} - 抽象基类
 * 自动生成于 ${new Date().toLocaleString()}
 */
class ${abstractClassName} {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  /**
   * 创建前的初始化操作
   */
  beforeCreate() {
    throw new Error('子类必须实现 beforeCreate 方法');
  }
  
  /**
   * 更新前的操作
   */
  beforeUpdate() {
    throw new Error('子类必须实现 beforeUpdate 方法');
  }
  
  /**
   * 验证数据合法性
   * @returns {boolean} 是否验证通过
   */
  validate() {
    throw new Error('子类必须实现 validate 方法');
  }
  
  /**
   * 转换为普通对象
   * @returns {Object}
   */
  toObject() {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = ${abstractClassName};
`.trim()
}

/**
 * 生成 Express 接口（TypeScript 类型定义）
 */
function generateExpressInterface(className) {
  const interfaceName = `I${className}`
  
  return `
/**
 * ${interfaceName} - ${className} 接口定义
 * 自动生成于 ${new Date().toLocaleString()}
 */

/**
 * ${className} 创建接口
 */
export interface ${interfaceName}Create {
  // ${className} 创建所需字段
}

/**
 * ${className} 更新接口
 */
export interface ${interfaceName}Update {
  // ${className} 更新所需字段
}

/**
 * ${className} 响应接口
 */
export interface ${interfaceName}Response {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ${className} 服务接口
 */
export interface ${interfaceName}Service {
  findAll(): Promise<${interfaceName}Response[]>;
  findById(id: string): Promise<${interfaceName}Response | null>;
  create(data: ${interfaceName}Create): Promise<${interfaceName}Response>;
  update(id: string, data: ${interfaceName}Update): Promise<${interfaceName}Response>;
  delete(id: string): Promise<void>;
}

module.exports = {
  ${interfaceName}Create,
  ${interfaceName}Update,
  ${interfaceName}Response,
  ${interfaceName}Service
};
`.trim()
}

/**
 * 生成 Express 工具类
 */
function generateExpressUtilClass(className) {
  const utilClassName = `${className}Util`
  
  return `
const { validationResult } = require('express-validator');

/**
 * ${utilClassName} - ${className} 工具类
 * 自动生成于 ${new Date().toLocaleString()}
 */
class ${utilClassName} {
  
  /**
   * 将${className}文档转换为响应对象
   * @param {Document} doc Mongoose文档
   * @returns {Object}
   */
  static toResponse(doc) {
    if (!doc) return null;
    
    const obj = doc.toObject();
    delete obj.__v;
    return obj;
  }
  
  /**
   * 验证请求参数
   * @param {Request} req Express请求对象
   * @returns {Object|null} 验证错误信息
   */
  static validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        status: 400,
        errors: errors.array()
      };
    }
    return null;
  }
  
  /**
   * 生成成功响应
   * @param {Object} data 响应数据
   * @param {number} statusCode 状态码
   * @returns {Object}
   */
  static successResponse(data, statusCode = 200) {
    return {
      status: statusCode,
      success: true,
      data
    };
  }
  
  /**
   * 生成错误响应
   * @param {string} message 错误信息
   * @param {number} statusCode 状态码
   * @returns {Object}
   */
  static errorResponse(message, statusCode = 500) {
    return {
      status: statusCode,
      success: false,
      message
    };
  }
  
  /**
   * 深拷贝对象
   * @param {Object} obj 源对象
   * @returns {Object}
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

module.exports = ${utilClassName};
`.trim()
}

/**
 * 生成 Flask/SQLAlchemy Model
 */
function generateFlaskModel(className, fields) {
  return `
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class ${className}(db.Model):
    """
    ${className} - 页面组件 Model
    自动生成于 ${new Date().toLocaleString()}
    """
    __tablename__ = '${className.toLowerCase()}'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
${fields.filter(f => f.trim()).join('\n').split('\n').map(line => '    ' + line).join('\n')}
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
`.trim()
}

/**
 * 生成 Flask 抽象类
 */
function generateFlaskAbstractClass(className) {
  const abstractClassName = `Abstract${className}`
  
  return `
from abc import ABC, abstractmethod
from datetime import datetime

class ${abstractClassName}(ABC):
    """
    ${abstractClassName} - 抽象基类
    自动生成于 ${new Date().toLocaleString()}
    """
    
    def __init__(self):
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    @abstractmethod
    def before_create(self):
        """创建前的初始化操作"""
        pass
    
    @abstractmethod
    def before_update(self):
        """更新前的操作"""
        pass
    
    @abstractmethod
    def validate(self):
        """验证数据合法性"""
        pass
    
    def to_dict(self):
        """转换为字典"""
        return {
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
`.trim()
}

/**
 * 生成 Flask 接口（抽象基类形式）
 */
function generateFlaskInterface(className) {
  const interfaceName = `I${className}`
  
  return `
from abc import ABC, abstractmethod
from typing import List, Optional

class ${interfaceName}Service(ABC):
    """
    ${interfaceName}Service - ${className} 服务接口
    自动生成于 ${new Date().toLocaleString()}
    """
    
    @abstractmethod
    def find_all(self) -> List[dict]:
        """获取所有${className}"""
        pass
    
    @abstractmethod
    def find_by_id(self, id: int) -> Optional[dict]:
        """根据ID获取${className}"""
        pass
    
    @abstractmethod
    def save(self, data: dict) -> dict:
        """保存${className}"""
        pass
    
    @abstractmethod
    def update(self, id: int, data: dict) -> dict:
        """更新${className}"""
        pass
    
    @abstractmethod
    def delete(self, id: int) -> None:
        """删除${className}"""
        pass
`.trim()
}

/**
 * 生成 Flask 工具类
 */
function generateFlaskUtilClass(className) {
  const utilClassName = `${className}Util`
  
  return `
import json
from datetime import datetime

class ${utilClassName}:
    """
    ${utilClassName} - ${className} 工具类
    自动生成于 ${new Date().toLocaleString()}
    """
    
    @staticmethod
    def to_json(${className.toLowerCase()}_obj):
        """将${className}对象转换为JSON字符串"""
        if ${className.toLowerCase()}_obj is None:
            return None
        
        try:
            return json.dumps(${className.toLowerCase()}_obj, default=lambda o: o.__dict__)
        except Exception as e:
            raise ValueError(f"转换JSON失败: {str(e)}")
    
    @staticmethod
    def from_json(json_str):
        """将JSON字符串转换为字典"""
        if not json_str:
            return None
        
        try:
            return json.loads(json_str)
        except Exception as e:
            raise ValueError(f"解析JSON失败: {str(e)}")
    
    @staticmethod
    def is_empty(${className.toLowerCase()}_obj):
        """验证${className}对象是否为空"""
        return ${className.toLowerCase()}_obj is None
    
    @staticmethod
    def copy(${className.toLowerCase()}_obj):
        """复制${className}对象"""
        if ${className.toLowerCase()}_obj is None:
            return None
        
        return json.loads(json.dumps(${className.toLowerCase()}_obj, default=lambda o: o.__dict__))
    
    @staticmethod
    def format_datetime(dt):
        """格式化日期时间"""
        if dt is None:
            return None
        return dt.isoformat()
    
    @staticmethod
    def validate_fields(data, required_fields):
        """验证必填字段"""
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"缺少必填字段: {', '.join(missing_fields)}")
        return True
`.trim()
}

/**
 * 生成 API 接口代码
 * @param {string} className - 类名
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateAPIController(className, framework = 'springboot') {
  if (framework === 'springboot') {
    return addReferenceComment(generateSpringBootController(className), framework)
  } else if (framework === 'express') {
    return addReferenceComment(generateExpressController(className), framework)
  } else if (framework === 'flask') {
    return addReferenceComment(generateFlaskRoutes(className), framework)
  }
  
  return ''
}

/**
 * 生成 Spring Boot Controller
 */
function generateSpringBootController(className) {
  const camelCaseName = className.charAt(0).toLowerCase() + className.slice(1)
  
  return `
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

/**
 * ${className}Controller - 页面组件 API 控制器
 * 自动生成于 ${new Date().toLocaleString()}
 */
@RestController
@RequestMapping("/api/${camelCaseName}")
@CrossOrigin(origins = "*")
public class ${className}Controller {
  
  @Autowired
  private ${className}Service ${camelCaseName}Service;
  
  /**
   * 获取所有组件
   */
  @GetMapping
  public ResponseEntity<List<${className}>> getAll() {
    return ResponseEntity.ok(${camelCaseName}Service.findAll());
  }
  
  /**
   * 根据 ID 获取组件
   */
  @GetMapping("/{id}")
  public ResponseEntity<${className}> getById(@PathVariable Long id) {
    return ${camelCaseName}Service.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }
  
  /**
   * 创建组件
   */
  @PostMapping
  public ResponseEntity<${className}> create(@Valid @RequestBody ${className} ${camelCaseName}) {
    return ResponseEntity.ok(${camelCaseName}Service.save(${camelCaseName}));
  }
  
  /**
   * 更新组件
   */
  @PutMapping("/{id}")
  public ResponseEntity<${className}> update(
    @PathVariable Long id,
    @Valid @RequestBody ${className} ${camelCaseName}
  ) {
    return ResponseEntity.ok(${camelCaseName}Service.update(id, ${camelCaseName}));
  }
  
  /**
   * 删除组件
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    ${camelCaseName}Service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
`.trim()
}

/**
 * 生成 Express Controller
 */
function generateExpressController(className) {
  const camelCaseName = className.charAt(0).toLowerCase() + className.slice(1)
  
  return `
const express = require('express');
const router = express.Router();
const ${className} = require('../models/${className}');

/**
 * ${className}Controller - 页面组件 API 控制器
 * 自动生成于 ${new Date().toLocaleString()}
 */

/**
 * 获取所有组件
 */
router.get('/', async (req, res) => {
  try {
    const items = await ${className}.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 根据 ID 获取组件
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await ${className}.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '未找到' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 创建组件
 */
router.post('/', async (req, res) => {
  const item = new ${className}(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * 更新组件
 */
router.put('/:id', async (req, res) => {
  try {
    const item = await ${className}.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: '未找到' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * 删除组件
 */
router.delete('/:id', async (req, res) => {
  try {
    const item = await ${className}.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '未找到' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
`.trim()
}

/**
 * 生成 Flask Routes
 */
function generateFlaskRoutes(className) {
  const camelCaseName = className.charAt(0).toLowerCase() + className.slice(1)
  
  return `
from flask import Blueprint, request, jsonify
from models.${className} import ${className}

${camelCaseName}_bp = Blueprint('${camelCaseName}', __name__, url_prefix='/api/${camelCaseName}')

@${camelCaseName}_bp.route('/', methods=['GET'])
def get_all():
    """获取所有组件"""
    items = ${className}.query.all()
    return jsonify([item.to_dict() for item in items])

@${camelCaseName}_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    """根据 ID 获取组件"""
    item = ${className}.query.get_or_404(id)
    return jsonify(item.to_dict())

@${camelCaseName}_bp.route('/', methods=['POST'])
def create():
    """创建组件"""
    data = request.get_json()
    item = ${className}(**data)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@${camelCaseName}_bp.route('/<int:id>', methods=['PUT'])
def update(id):
    """更新组件"""
    item = ${className}.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
      setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@${camelCaseName}_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    """删除组件"""
    item = ${className}.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return '', 204
`.trim()
}

/**
 * 生成数据库迁移 SQL
 * @param {Array} components - 组件列表
 * @param {string} tableName - 表名
 * @param {string} dbType - 数据库类型 (mysql, postgresql, sqlite)
 * @returns {string}
 */
export function generateDatabaseMigration(components, tableName = 'page_components', dbType = 'mysql') {
  const columns = []
  
  // 基础字段
  columns.push({
    name: 'id',
    type: dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 
          dbType === 'postgresql' ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'
  })
  columns.push({
    name: 'created_at',
    type: dbType === 'mysql' ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : 
          dbType === 'postgresql' ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  })
  columns.push({
    name: 'updated_at',
    type: dbType === 'mysql' ? 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' : 
          dbType === 'postgresql' ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  })
  
  // 根据组件类型添加字段
  components.forEach(comp => {
    const config = COMPONENT_BACKEND_CONFIG[comp.type]
    if (!config) return
    
    if (config.type === 'text' || config.type === 'image' || config.type === 'link') {
      columns.push({
        name: config.field,
        type: dbType === 'mysql' ? 'VARCHAR(500)' : 
              dbType === 'postgresql' ? 'VARCHAR(500)' : 'TEXT'
      })
    }
  })
  
  // 生成 SQL
  if (dbType === 'mysql') {
    return generateMySQLMigration(tableName, columns)
  } else if (dbType === 'postgresql') {
    return generatePostgreSQLMigration(tableName, columns)
  } else if (dbType === 'sqlite') {
    return generateSQLiteMigration(tableName, columns)
  }
  
  return ''
}

function generateMySQLMigration(tableName, columns) {
  const columnDefs = columns.map(col => `  \`${col.name}\` ${col.type}`).join(',\n')
  
  return `
-- MySQL 迁移脚本
-- 自动生成于 ${new Date().toLocaleString()}

CREATE TABLE IF NOT EXISTS \`${tableName}\` (
${columnDefs}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`.trim()
}

function generatePostgreSQLMigration(tableName, columns) {
  const columnDefs = columns.map(col => `  ${col.name} ${col.type}`).join(',\n')
  
  return `
-- PostgreSQL 迁移脚本
-- 自动生成于 ${new Date().toLocaleString()}

CREATE TABLE IF NOT EXISTS ${tableName} (
${columnDefs}
);
`.trim()
}

function generateSQLiteMigration(tableName, columns) {
  const columnDefs = columns.map(col => `  ${col.name} ${col.type}`).join(',\n')
  
  return `
-- SQLite 迁移脚本
-- 自动生成于 ${new Date().toLocaleString()}

CREATE TABLE IF NOT EXISTS ${tableName} (
${columnDefs}
);
`.trim()
}

/**
 * 下载文本文件
 */
export function downloadTextFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ==================== 单组件后端代码生成 ====================

/**
 * 获取组件的后端配置
 * @param {string} componentType - 组件类型
 * @returns {Object|null}
 */
export function getComponentBackendConfig(componentType) {
  return COMPONENT_BACKEND_CONFIG[componentType] || null
}

/**
 * 为单个组件生成实体类代码
 * @param {Object} component - 组件数据
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateSingleComponentEntity(component, framework = 'springboot') {
  const config = COMPONENT_BACKEND_CONFIG[component.type]
  if (!config) return ''
  
  const className = config.className
  let fields = config.fields?.[framework] || []
  
  // 如果是自定义表单，动态生成字段
  if (config.isDynamic && component.props?.formItems) {
    fields = generateDynamicFormFields(component.props.formItems, framework)
  }
  
  if (framework === 'springboot') {
    return generateSpringBootEntity(className, fields.map(f => '  ' + f), [])
  } else if (framework === 'express') {
    return generateExpressSchema(className, fields)
  } else if (framework === 'flask') {
    return generateFlaskModel(className, fields.map(f => '    ' + f))
  }
  
  return ''
}

/**
 * 根据自定义表单字段动态生成后端字段定义
 * @param {Array} formItems - 表单字段列表
 * @param {string} framework - 后端框架
 * @returns {Array} - 字段定义列表
 */
function generateDynamicFormFields(formItems, framework) {
  const fields = []
  
  formItems.forEach(item => {
    // 跳过文本描述类型，它不是表单字段
    if (item.type === 'description') {
      return
    }
    
    const fieldName = item.id
    const required = item.required
    
    switch (framework) {
      case 'springboot':
        let javaType = 'String'
        if (item.type === 'tel' || item.type === 'number') {
          javaType = 'String' // 电话号码也用 String
        } else if (item.type === 'checkbox') {
          javaType = 'Boolean'
        }
        const constraint = required ? ' @NotBlank(message = "此字段不能为空")' : ''
        fields.push(`private ${javaType} ${fieldName};${constraint}`)
        break
        
      case 'express':
        const expressType = item.type === 'checkbox' ? 'Boolean' : 'String'
        const expressRequired = required ? '{ type: String, required: true }' : 'String'
        fields.push(`${fieldName}: ${expressRequired}`)
        break
        
      case 'flask':
        const flaskType = item.type === 'checkbox' ? 'db.Boolean' : 'db.String(255)'
        const flaskNullable = required ? ', nullable=False' : ''
        fields.push(`${fieldName} = db.Column(${flaskType}${flaskNullable})`)
        break
    }
  })
  
  return fields
}

/**
 * 为单个组件生成 API 控制器代码
 * @param {Object} component - 组件数据
 * @param {string} framework - 后端框架
 * @returns {string}
 */
export function generateSingleComponentController(component, framework = 'springboot') {
  const config = COMPONENT_BACKEND_CONFIG[component.type]
  if (!config) return ''
  
  const className = config.className
  return generateAPIController(className, framework)
}

/**
 * 获取组件支持的后端框架列表
 * @returns {Array}
 */
export function getSupportedFrameworks() {
  return [
    { value: 'springboot', label: 'Spring Boot (Java)' },
    { value: 'express', label: 'Express (Node.js)' },
    { value: 'flask', label: 'Flask (Python)' }
  ]
}