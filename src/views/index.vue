<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>基于区块链的库存管理系统</h2>
        <h4>
          &emsp;&emsp;伴随着互联网技术的持续发展，物流运输业正处于高速发展的阶段，而仓储行业作为物流运输业中的一个重要组成环节，
          也愈发受到重视。目前部分仓储系统的信息易篡改、流程不透明、中心化严重、缺乏信任等问题逐渐暴露在人们面前。对此可以使用区块链技术，
          优化仓储货物溯源验证的工作方式，支持更加准确以及更加可信的验证，从而减少人为的失误以及腐败问题，使仓储工作能够更加健康稳定的进行。
          此系统就是在普通库存管理系统的基础上把部分数据移植到区块链上，实现数据的不可篡改性和可溯源性。
        </h4>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>技术选型</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Spring Security</li>
              <li>JWT</li>
              <li>MyBatis</li>
              <li>Druid</li>
              <li>Fastjson</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>Quill</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="12">
            <h4>其他技术</h4>
            <ul>
              <li>区块链：Hyperledger Fabric</li>
              <li>数据库：MySQL</li>
              <li>Linux</li>
              <li>Docker</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning" style="font-size: 16px">
          前端项目源码 Github
          <el-link href="https://github.com/sasr11/RuoYi-Vue3" type="primary" target="_blank"
          >&nbsp&nbsp&nbsp&nbsp☛☛点我进入☚☚
          </el-link>
          <br />
          后端项目源码 Gitee
          <el-link href="https://gitee.com/sasr_zhj/RuoYi-Vue" type="primary" target="_blank"
          >&nbsp&nbsp&nbsp&nbsp☛☛点我进入☚☚
          </el-link>
          <br />
          使用的开源框架 若依官网
          <el-link href="http://ruoyi.vip" type="primary" target="_blank"
          >&nbsp&nbsp&nbsp&nbsp☛☛点我进入☚☚
          </el-link>
          <br />
        </blockquote>

        <hr />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>测试账号</span>
            </div>
          </template>
          <el-table :data="userData" height="145">
            <el-table-column label="角色" align="center" key="role" prop="role"></el-table-column>
            <el-table-column label="账号" align="center" key="userName" prop="userName"></el-table-column>
            <el-table-column label="密码" align="center" key="pwd" prop="pwd"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>更新日志</span>
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="v1.0 - 2023.02.25    <库存管理系统基本功能完成>">
              <ol>
                <li>人员管理：部门表、角色表、用户表</li>
                <li>出入库管理：仓库表、入库表、出库表</li>
                <li>物资管理：物资类别表、物资表</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v1.1 - 2023.03.01    <新增出库流程管理>">
              <ol>
                <li>流程管理：流程表、流程节点表</li>
                <li>审批管理：审批表</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v1.2 - 2023.03.12    <入库操作与区块链耦合>">
              <ol>
                <li>新增入库、更新入库信息、删除入库信息的区块链操作</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v1.3 - 2023.04.12    <出库操作与区块链耦合>">
              <ol>
                <li>新增出库、更新出库信息、删除出库信息</li>
                <li>新增初始化功能</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('1.3')

const userData = ref([
    { role: "超级管理员", userName: "admin", pwd: "admin123" },
    { role: "仓库管理员", userName: "zhang", pwd: "123456" },
    { role: "普通用户", userName: "zhao", pwd: "123456" },
    { role: "普通用户", userName: "ling", pwd: "123456" },
    { role: "普通用户", userName: "wang", pwd: "123456" },
])

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

