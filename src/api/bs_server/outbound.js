import request from '@/utils/request'

// 初始化区块链的出库列表
export function InitOutbound(query) {
  return request({
    url: '/bs_server/outbound/init',
    method: 'get',
    params: query
  })
}

// 查询出库列表
export function listOutbound(query) {
  return request({
    url: '/bs_server/outbound/list',
    method: 'get',
    params: query
  })
}

// 查询出库详细
export function getOutbound(outboundId) {
  return request({
    url: '/bs_server/outbound/' + outboundId,
    method: 'get'
  })
}

// 新增出库
export function addOutbound(data) {
  return request({
    url: '/bs_server/outbound',
    method: 'post',
    data: data
  })
}

// 修改出库
export function updateOutbound(data) {
  return request({
    url: '/bs_server/outbound',
    method: 'put',
    data: data
  })
}

// 删除出库
export function delOutbound(outboundId) {
  return request({
    url: '/bs_server/outbound/' + outboundId,
    method: 'delete'
  })
}
