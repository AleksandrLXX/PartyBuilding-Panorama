const productionUrl = '/'
const developmentUrl = '/'

const links = process.env.NODE_ENV === 'production' ? productionUrl : developmentUrl

export const link = links
export const modelUrl = links
