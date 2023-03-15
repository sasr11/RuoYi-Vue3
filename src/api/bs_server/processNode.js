import request from '@/utils/request'

// 查询流程节点列表
export function listProcessNode(query) {
  return request({
    url: '/bs_server/processNode/list',
    method: 'get',
    params: query
  })
}

// 查询流程节点详细
export function getProcessNode(processNodeId) {
  return request({
    url: '/bs_server/processNode/' + processNodeId,
    method: 'get'
  })
}

// 新增流程节点
export function addProcessNode(data) {
  return request({
    url: '/bs_server/processNode',
    method: 'post',
    data: data
  })
}

// 修改流程节点
export function updateProcessNode(data) {
  return request({
    url: '/bs_server/processNode',
    method: 'put',
    data: data
  })
}

// 删除流程节点
export function delProcessNode(processNodeId) {
  return request({
    url: '/bs_server/processNode/' + processNodeId,
    method: 'delete'
  })
}
