<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="出库编号" prop="outboundId">
        <el-input
          v-model="queryParams.outboundId"
          placeholder="请输入出库编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="clientName">
        <el-input
          v-model="queryParams.clientName"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓库名称" prop="warehouseName">
        <el-input
          v-model="queryParams.warehouseName"
          placeholder="请输入仓库名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物资名称" prop="materialName">
        <el-input
          v-model="queryParams.materialName"
          placeholder="请输入物资名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
        <el-button icon="refresh"  @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
        v-loading="loading"
        :data="outboundDdetailList"
        @selection-change="handleSelectionChange"
        show-summary
        :summary-method="summaryMethod"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="出库编号" align="center" prop="outboundId" />
      <el-table-column label="客户名称" align="center" prop="clientName" />
      <el-table-column label="仓库名称" align="center" prop="warehouseName" />
      <el-table-column label="物资名称" align="center" prop="materialName" />
      <el-table-column label="出库数量" align="center" prop="count" />
      <el-table-column label="单价" align="center" prop="price" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改出库详情对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="出库编号" prop="outboundId">
          <el-input v-model="form.outboundId" placeholder="请输入出库编号" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入显示顺序" />
        </el-form-item>
        <el-form-item label="客户编号" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入客户编号" />
        </el-form-item>
        <el-form-item label="仓库编号" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="请输入仓库编号" />
        </el-form-item>
        <el-form-item label="物资编号" prop="materialId">
          <el-input v-model="form.materialId" placeholder="请输入物资编号" />
        </el-form-item>
        <el-form-item label="数量" prop="count">
          <el-input v-model="form.count" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input v-model="form.price" placeholder="请输入单价" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOutboundDdetail, getOutboundDdetail, delOutboundDdetail, addOutboundDdetail, updateOutboundDdetail } from "@/api/bs_server/outboundDdetail";

export default {
  name: "OutboundDdetail",
  data() {
    return {
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
      // 出库详情表格数据
      outboundDdetailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        outboundId: null,
        clientId: null,
        warehouseId: null,
        materialId: null,
        price: null
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
  },
  methods: {
    /** 表格合计 */
    summaryMethod(params) { // params是由 columns列数和data整个表格数据 组成的对象，具体计算看个人需求
      let {columns, data} = params;
      let sum = 0;
      data.forEach((value) => {
        if(value.count !== '' && value.price !== ''){
          sum = sum + parseInt(value.count) * parseFloat(value.price);
        }
      })
      return ['', '', '', '', '', '', '总价', '¥ '+sum, ''];  //最后的返回值，列表中元素个数与列数相同
    },
    /** 查询出库详情列表 */
    getList() {
      this.loading = true;
      listOutboundDdetail(this.queryParams).then(response => {
        this.outboundDdetailList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        outboundDetailId: null,
        outboundId: null,
        orderNum: null,
        clientId: null,
        warehouseId: null,
        materialId: null,
        count: null,
        price: null
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
      this.ids = selection.map(item => item.outboundDetailId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加出库详情";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const outboundDetailId = row.outboundDetailId || this.ids
      getOutboundDdetail(outboundDetailId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改出库详情";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.outboundDetailId != null) {
            updateOutboundDdetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addOutboundDdetail(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const outboundDetailIds = row.outboundDetailId || this.ids;
      this.$modal.confirm('是否确认删除出库详情编号为"' + outboundDetailIds + '"的数据项？').then(function() {
        return delOutboundDdetail(outboundDetailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/outboundDdetail/export', {
        ...this.queryParams
      }, `outboundDdetail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
