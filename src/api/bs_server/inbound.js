import request from '@/utils/request'

// 查询入库列表
export function listInbound(query) {
  return request({
    url: '/bs_server/inbound/list',
    method: 'get',
    params: query
  })
}

// 查询入库详细
export function getInbound(inboundId) {
  return request({
    url: '/bs_server/inbound/' + inboundId,
    method: 'get'
  })
}

// 新增入库
export function addInbound(data) {
  return request({
    url: '/bs_server/inbound',
    method: 'post',
    data: data
  })
}

// 修改入库
export function updateInbound(data) {
  return request({
    url: '/bs_server/inbound',
    method: 'put',
    data: data
  })
}

// 删除入库
export function delInbound(inboundId) {
  return request({
    url: '/bs_server/inbound/' + inboundId,
    method: 'delete'
  })
}
