<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库编号" prop="inboundId">
        <el-input
          v-model="queryParams.inboundId"
          placeholder="请输入入库编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商名称" prop="supplierName" label-width="auto">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入供应商名称"
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
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

<!--    <el-row :gutter="10" class="mb8">-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="plus"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['bs_server:inboundDetail:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="edit"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['bs_server:inboundDetail:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="delete"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['bs_server:inboundDetail:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="warning"-->
<!--          plain-->
<!--          icon="download"-->
<!--          @click="handleExport"-->
<!--          v-hasPermi="['bs_server:inboundDetail:export']"-->
<!--        >导出</el-button>-->
<!--      </el-col>-->
<!--      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>-->
<!--    </el-row>-->

    <el-table
        v-loading="loading"
        :data="inboundDetailList"
        @selection-change="handleSelectionChange"
        show-summary
        :summary-method="summaryMethod"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="入库编号" align="center" prop="inboundId" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="物资名称" align="center" prop="materialName" />
      <el-table-column label="入库数量" align="center" prop="count" />
      <el-table-column label="单价" align="center" prop="price" />
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template #default="scope">-->
<!--          <el-button-->
<!--            type="text"-->
<!--            icon="edit"-->
<!--            @click="handleUpdate(scope.row)"-->
<!--            v-hasPermi="['bs_server:inboundDetail:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--            type="text"-->
<!--            icon="delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['bs_server:inboundDetail:remove']"-->
<!--          >删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改入库详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="入库编号" prop="inboundId">
          <el-input v-model="form.inboundId" placeholder="请输入入库编号" />
        </el-form-item>
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="供应商编号" prop="supplierId">
          <el-input v-model="form.supplierId" placeholder="请输入供应商编号" />
        </el-form-item>
        <el-form-item label="仓库编号" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="请输入仓库编号" />
        </el-form-item>
        <el-form-item label="物资编号" prop="materialId">
          <el-input v-model="form.materialId" placeholder="请输入物资编号" />
        </el-form-item>
        <el-form-item label="入库数量" prop="count">
          <el-input v-model="form.count" placeholder="请输入入库数量" />
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
import { listInboundDetail, getInboundDetail, delInboundDetail, addInboundDetail, updateInboundDetail } from "@/api/bs_server/inboundDetail";

export default {
  name: "InboundDetail",
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
      // 入库详情表格数据
      inboundDetailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inboundId: null,
        supplierName: null,
        warehouseName: null,
        materialName: null,
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
    /** 查询入库详情列表 */
    getList() {
      this.loading = true;
      listInboundDetail(this.queryParams).then(response => {
        this.inboundDetailList = response.rows;
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
        inboundDetailId: null,
        inboundId: null,
        orderNum: null,
        supplierId: null,
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
      this.ids = selection.map(item => item.inboundDetailId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加入库详情";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const inboundDetailId = row.inboundDetailId || this.ids
      getInboundDetail(inboundDetailId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改入库详情";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.inboundDetailId != null) {
            updateInboundDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInboundDetail(this.form).then(response => {
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
      const inboundDetailIds = row.inboundDetailId || this.ids;
      this.$modal.confirm('是否确认删除入库详情编号为"' + inboundDetailIds + '"的数据项？').then(function() {
        return delInboundDetail(inboundDetailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/inboundDetail/export', {
        ...this.queryParams
      }, `inboundDetail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
