import request from '@/utils/request'

// 查询审批列表
export function listApproval(query) {
  return request({
    url: '/bs_server/approval/list',
    method: 'get',
    params: query
  })
}

// 查询审批详细
export function getApproval(approvalId) {
  return request({
    url: '/bs_server/approval/' + approvalId,
    method: 'get'
  })
}

// 新增审批
export function addApproval(data) {
  return request({
    url: '/bs_server/approval',
    method: 'post',
    data: data
  })
}

// 修改审批
export function updateApproval(data) {
  return request({
    url: '/bs_server/approval',
    method: 'put',
    data: data
  })
}

// 删除审批
export function delApproval(approvalId) {
  return request({
    url: '/bs_server/approval/' + approvalId,
    method: 'delete'
  })
}
