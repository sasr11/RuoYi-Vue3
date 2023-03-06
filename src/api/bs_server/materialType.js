import request from '@/utils/request'

// 查询物资分类列表
export function listMaterialType(query) {
  return request({
    url: '/bs_server/materialType/list',
    method: 'get',
    params: query
  })
}

// 查询物资分类详细
export function getMaterialType(materialTypeId) {
  return request({
    url: '/bs_server/materialType/' + materialTypeId,
    method: 'get'
  })
}

// 新增物资分类
export function addMaterialType(data) {
  return request({
    url: '/bs_server/materialType',
    method: 'post',
    data: data
  })
}

// 修改物资分类
export function updateMaterialType(data) {
  return request({
    url: '/bs_server/materialType',
    method: 'put',
    data: data
  })
}

// 删除物资分类
export function delMaterialType(materialTypeId) {
  return request({
    url: '/bs_server/materialType/' + materialTypeId,
    method: 'delete'
  })
}
