import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'Z1 Shop',
  version: '1.0.0',
  description: '', // use info instead
  tagIndex: 2,
  info: {
    title: 'title',
    version: '1.0.0',
    description: '',
  },
  snakeCase: true,

  debug: false, // set to true, to get some useful debug output
  ignore: ['/swagger', '/docs'],
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  authMiddlewares: ['auth:jwt'],
  defaultSecurityScheme: 'jwt',
  persistAuthorization: true,
  showFullPath: false,
}
