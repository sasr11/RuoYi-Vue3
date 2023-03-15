<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表单编号" prop="billId">
        <el-input
          v-model="queryParams.billId"
          placeholder="请输入表单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程名称" prop="processName">
        <el-input
          v-model="queryParams.processName"
          placeholder="请输入流程名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="userName_==='admin'" label="审批人" prop="userName" label-width="auto">
        <el-input
            v-model="queryParams.userName"
            placeholder="请输入审批人名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择审批状态" clearable>
          <el-option
            v-for="dict in bs_approval_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
        <el-button icon="refresh"  @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['bs_server:approval:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="download"
          @click="handleExport"
          v-hasPermi="['bs_server:approval:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="approvalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="表单编号" align="center" prop="billId" />
      <el-table-column label="流程名称" align="center" prop="processName" />
      <el-table-column label="节点名称" align="center" prop="processNodeName" />
      <el-table-column label="审批人" align="center" prop="userName" />
      <el-table-column label="审批状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="bs_approval_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime"/>
      <el-table-column label="审批意见" align="center" prop="comment" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bs_server:approval:edit']"
          >审批</el-button>
          <el-button
            type="text"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bs_server:approval:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改审批对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-divider content-position="center">出库表信息</el-divider>
      <el-form :inline="true" ref="form" :model="outbound" :rules="rules" label-width="100px" disabled>
        <el-form-item label="出库编号：" prop="outboundId">
          <div style="width: 250px">{{outbound.outboundId}}</div>
        </el-form-item>
        <el-form-item label="申请人：" prop="userId">
          <div style="width: 250px">{{outbound.createBy}}</div>
        </el-form-item>
        <el-form-item label="出库总价：" prop="totalPrice">
          <div style="width: 250px">{{outbound.totalPrice}}</div>
        </el-form-item>
        <!-- 出库详情表数据 -->
        <el-table
            :data="outboundDetailList"
            ref="outboundDetail"
            height="160"
            show-summary
            :summary-method="summaryMethod2"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="orderNum" width="50"/>
          <el-table-column label="客户" align="center" prop="clientName" width="150"/>
          <el-table-column label="仓库" align="center" prop="warehouseName" width="150"/>
          <el-table-column label="物资" align="center" prop="materialName" width="150"/>
          <el-table-column label="数量" align="center" prop="count" width="150"/>
          <el-table-column label="单价" align="center" prop="price" width="150"/>
        </el-table>
      </el-form>
      <!-- 审批表数据 -->
      <el-divider content-position="center">审批表信息</el-divider>
      <el-form :inline="true" ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="表单编号：" prop="billId">
          <div style="width: 250px">{{form.billId}}</div>
        </el-form-item>
        <el-form-item label="流程名称：" prop="processName">
          <div style="width: 250px">{{form.processName}}</div>
        </el-form-item>
        <el-form-item label="节点名称：" prop="processNodeName">
          <div style="width: 250px">{{form.processNodeName}}</div>
        </el-form-item>
        <el-form-item label="审批人：" prop="userName">
          <div style="width: 250px">{{form.userName}}</div>
        </el-form-item>
        <el-form-item label="审批意见：" prop="comment" label-width="100px">
          <el-input :disabled="form.status==='1'" v-model="form.comment" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <!-- 操作 -->
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="submitForm('0')"
                   :disabled="form.status==='1' || form.status==='2'">驳 回</el-button>
        <el-button type="primary" @click="submitForm('1')"
                   :disabled="form.status==='1'">通 过</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listApproval, getApproval, delApproval, addApproval, updateApproval } from "@/api/bs_server/approval";
import { useDict } from "@/utils/dict";
import { getOutbound } from "@/api/bs_server/outbound";
import store from '@/store'

export default {
  name: "Approval",
  data() {
    return {
      // 当前用户名称
      userName_: store.state.value.user.name,
      // 字典数据
      bs_approval_status: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,

      // 审批表格数据
      approvalList: [],
      // 出库表数据
      outbound: {},
      // 出库详情表格数据
      outboundDetailList: [],

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        billId: null,
        processName: null,
        userName: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
    this.bs_approval_status = useDict("bs_approval_status")["bs_approval_status"];  //获取字典数据
  },
  methods: {
    /** 查询审批列表 */
    getList() {
      this.loading = true;
      if(this.userName_ !== "admin") this.queryParams.userName = this.userName_;
      listApproval(this.queryParams).then(response => {
        this.approvalList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 表格2合计 */
    summaryMethod2(params) { // params是由 columns和data组成的对象，具体计算看个人需求
      let {columns, data} = params;
      let sum = 0;   //最后的返回值，列表中元素个数与列数相同
      data.forEach((value) => {
        if(value.count !== '' && value.price !== ''){
          sum = sum + parseInt(value.count) * parseFloat(value.price);
        }
      })
      this.outbound.totalPrice = sum;
      return ['', '', '', '', '', '总价', '¥ '+sum];
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        approvalId: null,
        billId: null,
        processId: null,
        processNodeId: null,
        userId: null,
        status: null,
        comment: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.approvalId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加审批";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const approvalId = row.approvalId || this.ids
      const outboundId = row.billId
      getOutbound(outboundId).then(response => {  //出库表数据
        this.outbound = response.data;
        this.outboundDetailList = response.data.outboundDetailList;
      });
      console.log(this.outbound)
      getApproval(approvalId).then(response => {  //审批表数据
        this.form = response.data;
        this.open = true;
        this.title = "审批";
      });
    },
    /** 提交按钮 */
    submitForm(flag) {
      if(flag === '0') this.form.status = '2';
      else this.form.status = '1';
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.approvalId != null) {
            updateApproval(this.form).then(response => {
              this.$modal.msgSuccess("提交成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const approvalIds = row.approvalId || this.ids;
      this.$modal.confirm('是否确认删除审批编号为"' + approvalIds + '"的数据项？').then(function() {
        return delApproval(approvalIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/approval/export', {
        ...this.queryParams
      }, `approval_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
