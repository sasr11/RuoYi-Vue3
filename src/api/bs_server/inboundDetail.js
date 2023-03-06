import request from '@/utils/request'

// 查询入库详情列表
export function listInboundDetail(query) {
  return request({
    url: '/bs_server/inboundDetail/list',
    method: 'get',
    params: query
  })
}

// 查询入库详情详细
export function getInboundDetail(inboundDetailId) {
  return request({
    url: '/bs_server/inboundDetail/' + inboundDetailId,
    method: 'get'
  })
}

// 新增入库详情
export function addInboundDetail(data) {
  return request({
    url: '/bs_server/inboundDetail',
    method: 'post',
    data: data
  })
}

// 修改入库详情
export function updateInboundDetail(data) {
  return request({
    url: '/bs_server/inboundDetail',
    method: 'put',
    data: data
  })
}

// 删除入库详情
export function delInboundDetail(inboundDetailId) {
  return request({
    url: '/bs_server/inboundDetail/' + inboundDetailId,
    method: 'delete'
  })
}
