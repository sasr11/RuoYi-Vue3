import request from '@/utils/request'

// 查询物资列表
export function listMaterial(query) {
  return request({
    url: '/bs_server/material/list',
    method: 'get',
    params: query
  })
}

// 查询物资详细
export function getMaterial(materialId) {
  return request({
    url: '/bs_server/material/' + materialId,
    method: 'get'
  })
}

// 新增物资
export function addMaterial(data) {
  return request({
    url: '/bs_server/material',
    method: 'post',
    data: data
  })
}

// 修改物资
export function updateMaterial(data) {
  return request({
    url: '/bs_server/material',
    method: 'put',
    data: data
  })
}

// 删除物资
export function delMaterial(materialId) {
  return request({
    url: '/bs_server/material/' + materialId,
    method: 'delete'
  })
}
