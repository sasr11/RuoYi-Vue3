import request from '@/utils/request'

// 查询出库详情列表
export function listOutboundDdetail(query) {
  return request({
    url: '/bs_server/outboundDdetail/list',
    method: 'get',
    params: query
  })
}

// 查询出库详情详细
export function getOutboundDdetail(outboundDetailId) {
  return request({
    url: '/bs_server/outboundDdetail/' + outboundDetailId,
    method: 'get'
  })
}

// 新增出库详情
export function addOutboundDdetail(data) {
  return request({
    url: '/bs_server/outboundDdetail',
    method: 'post',
    data: data
  })
}

// 修改出库详情
export function updateOutboundDdetail(data) {
  return request({
    url: '/bs_server/outboundDdetail',
    method: 'put',
    data: data
  })
}

// 删除出库详情
export function delOutboundDdetail(outboundDetailId) {
  return request({
    url: '/bs_server/outboundDdetail/' + outboundDetailId,
    method: 'delete'
  })
}
