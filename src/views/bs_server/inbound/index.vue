<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="入库编号" prop="inboundId" label-width="auto">
        <el-input
            v-model="queryParams.inboundId"
            placeholder="请输入入库表单号"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建者" prop="createBy" label-width="auto">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入操作者名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库者" prop="updateBy" label-width="auto">
        <el-input
            v-model="queryParams.updateBy"
            placeholder="请输入入库者名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择入库状态" clearable>
          <el-option
            v-for="dict in bs_inbound"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="daterangeCreateTime"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间">
        <el-date-picker
            v-model="daterangeUpdateTime"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['bs_server:inbound:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['bs_server:inbound:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['bs_server:inbound:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-if="role_ === 'admin'"
            type="success"
            plain
            icon="Edit"
            @click="handleInit"
        >同步</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格，显示数据 -->
    <el-table
        v-loading="loading"
        :data="inboundList"
        @selection-change="handleSelectionChange"
        show-summary
        :summary-method="summaryMethod1"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="入库编号" align="center" prop="inboundId" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="入库总价" align="center" prop="totalPrice" />
      <el-table-column label="入库状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="bs_inbound" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="155" align="center" prop="createTime"/>
      <el-table-column label="更新者" align="center" prop="updateBy"/>
      <el-table-column label="更新时间" width="155" align="center" prop="updateTime"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-if="scope.row.status==='0'"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bs_server:inbound:edit']"
          >提交</el-button>
          <el-button
            v-if="scope.row.status==='1'"
            type="text"
            icon="View"
            @click="handleSee(scope.row)"
            v-hasPermi="['bs_server:inbound:edit']"
          >查看</el-button>
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bs_server:inbound:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改入库对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form :inline="true" ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item v-if="form.inboundId != undefined" label="入库编号" prop="inboundId">
          <div style="width: 250px">{{form.inboundId}}</div>
        </el-form-item>
        <el-form-item v-if="form.userId != undefined" label="创建者" prop="createBy">
          <div style="width: 250px">{{form.createBy}}</div>
        </el-form-item>
        <el-form-item label="入库总价" prop="totalPrice">
          <div style="width: 250px">{{form.totalPrice}}</div>
        </el-form-item>
        <!-- 入库详情 -->
        <el-divider content-position="center">入库详情信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus"  @click="handleAddInboundDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete"  @click="handleDeleteInboundDetail">删除</el-button>
          </el-col>
        </el-row>
        <!-- 入库详情表数据 -->
        <el-table
            :data="inboundDetailList"
            :row-class-name="rowInboundDetailIndex"
            @selection-change="handleInboundDetailSelectionChange"
            ref="inboundDetail"
            height="250"
            show-summary
            :summary-method="summaryMethod2"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="orderNum" width="50"/>
          <el-table-column label="供应商" align="center" prop="supplierId"  width="150">
            <template #default="scope">
              <el-select v-model="scope.row.supplierId" placeholder="请选择供应商" clearable>
                <el-option
                    v-for="dict in supplierList"
                    :key="dict.supplierId"
                    :label="dict.supplierName"
                    :value="dict.supplierId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="仓库" align="center" prop="warehouseId"  width="150">
            <template #default="scope">
              <el-select v-model="scope.row.warehouseId" placeholder="请选择仓库" clearable>
                <el-option
                    v-for="dict in warehouseList"
                    :key="dict.warehouseId"
                    :label="dict.warehouseName"
                    :value="dict.warehouseId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="物资名称" align="center" prop="materialId"  width="150">
            <template #default="scope">
              <el-select v-model="scope.row.materialId" placeholder="请选择物资名称" clearable>
                <el-option
                    v-for="dict in materialList"
                    :key="dict.materialId"
                    :label="dict.materialName"
                    :value="dict.materialId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="入库数量" align="center" prop="count" width="150">
            <template #default="scope">
              <el-input-number style="width: 120px" v-model="scope.row.count" controls-position="right" :min="0" />
            </template>
          </el-table-column>
          <el-table-column label="单价" align="center" prop="price" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.price" placeholder="请输入单价"/>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">提 交</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看数据对话框 -->
    <el-dialog :title="title2" v-model="open2" width="900px" append-to-body>
      <el-form :inline="true" ref="form" :model="form" :rules="rules" label-width="100px" disabled>
        <el-form-item label="入库编号" prop="inboundId">
          <div style="width: 250px">{{form.inboundId}}</div>
        </el-form-item>
        <el-form-item label="创建者" prop="createBy">
          <div style="width: 250px">{{form.createBy}}</div>
        </el-form-item>
        <el-form-item label="入库总价" prop="totalPrice">
          <div style="width: 250px">{{form.totalPrice}}</div>
        </el-form-item>
        <el-form-item label="入库者" prop="updateBy">
          <div style="width: 250px">{{form.updateBy}}</div>
        </el-form-item>
        <!-- 入库详情 -->
        <el-divider content-position="center">入库详情信息</el-divider>
        <!-- 入库详情表数据 -->
        <el-table
            :data="inboundDetailList"
            ref="inboundDetail"
            height="250"
            show-summary
            :summary-method="summaryMethod2"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="orderNum" width="50"/>
          <el-table-column label="供应商" align="center" prop="supplierName"  width="150"/>
          <el-table-column label="仓库" align="center" prop="warehouseName"  width="150"/>
          <el-table-column label="物资名称" align="center" prop="materialName"  width="150"/>
          <el-table-column label="入库数量" align="center" prop="count" width="150"/>
          <el-table-column label="单价" align="center" prop="price" width="150"/>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listInbound, getInbound, delInbound, addInbound, updateInbound, InitInbound} from "@/api/bs_server/inbound";
import { listMaterial } from "@/api/bs_server/material";
import { listSupplier } from "@/api/bs_server/supplier";
import { listWarehouse } from "@/api/bs_server/warehouse";
import { useDict } from "@/utils/dict";
import store from "@/store";

export default {
  name: "Inbound",
  data() {
    return {
      role_: store.state.value.user.roles[0],
      // 字典数据
      bs_inbound: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedInboundDetail: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,

      // 入库表格数据
      inboundList: [],
      // 入库详情表格数据
      inboundDetailList: [],
      // 供应商列表数据
      supplierList: [],
      // 仓库列表数据
      warehouseList: [],
      // 物资编号数据
      materialList: [],

      // 弹出层标题
      title: "", title2: "",
      // 是否显示弹出层
      open: false, open2: false,
      // 创建时间范围
      daterangeCreateTime: [],
      // 更新时间范围
      daterangeUpdateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inboundId: null,
        status: null,
        createBy: null,
        updateBy: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        status: { required: true, message: '请选择状态', trigger: 'blur' },
      }
    };
  },
  created() {
    this.getList();
    this.bs_inbound = useDict("bs_inbound")["bs_inbound"];  //获取字典数据
  },
  methods: {
    /** 表格1合计 */
    summaryMethod1(params) { // params是由 columns和data组成的对象，具体计算看个人需求
      let {columns, data} = params;
      let sums = [];   //最后的返回值，列表中元素个数与列数相同
      columns.forEach((column, index) => {  //遍历每一列
        if (index === 0) {  //第一列的显示
          sums[index] = '总价'
          return
        }
        const values = data.map((item) => Number(item[column.property]))
        if (index === 3) {   //对第三列进行统计
          sums[index] = `¥ ${values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!Number.isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)}`
        } else {
          sums[index] = ''   //其他列的显示
        }
      })
      return sums
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
      this.form.totalPrice = sum;
      return ['', '', '', '', '', '总价', '¥ '+sum];
    },
    /** 查询入库列表 */
    getList() {
      this.loading = true;
      // 设置时间范围查询的参数
      this.queryParams.params = {};
      if (null != this.daterangeCreateTime && '' !== this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      }
      if (null != this.daterangeUpdateTime && '' !== this.daterangeUpdateTime) {
        this.queryParams.params["beginUpdateTime"] = this.daterangeUpdateTime[0];
        this.queryParams.params["endUpdateTime"] = this.daterangeUpdateTime[1];
      }
      listInbound(this.queryParams).then(response => {
        this.inboundList = response.rows;
        this.total = response.total;
      });
      this.getListSupplier();
      this.getListWarehouse();
      this.getListMaterial();
      this.loading = false;
    },
    getListSupplier(){
      listSupplier().then(res =>{
        this.supplierList = res.rows;
      })
    },
    getListWarehouse(){
      listWarehouse().then(res =>{
        this.warehouseList = res.rows;
      })
    },
    getListMaterial(){
      this.queryParams.pageSize = 30;
      listMaterial(this.queryParams).then(res =>{
        this.materialList = res.rows;
        console.log(this.materialList)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.open2 = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        inboundId: null,
        userId: null,
        totalPrice: null,
        status: null,
        createTime: null,
        updateTime: null
      };
      this.inboundDetailList = [];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeCreateTime = [];
      this.daterangeUpdateTime = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.inboundId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加入库";
      this.form.totalPrice = 0;
    },
    /** 提交按钮操作 */
    handleUpdate(row) {
      this.reset();
      const inboundId = row.inboundId || this.ids
      getInbound(inboundId).then(response => {
        this.form = response.data;
        this.inboundDetailList = response.data.inboundDetailList;
        this.open = true;
        this.title = "提交入库";
      });
    },
    /** 初始化区块链数据 */
    handleInit() {
      InitInbound().then(response => {
      });
    },
    /** 查看按钮操作 */
    handleSee(row) {
      this.reset();
      const inboundId = row.inboundId || this.ids
      getInbound(inboundId).then(response => {
        this.form = response.data;
        this.inboundDetailList = response.data.inboundDetailList;
        this.open2 = true;
        this.title2 = "查看入库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.inboundDetailList = this.inboundDetailList;
          if (this.form.inboundId != null) {
            // update
            updateInbound(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            // add;
            addInbound(this.form).then(response => {
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
      const inboundIds = row.inboundId || this.ids;
      this.$modal.confirm('是否确认删除入库编号为"' + inboundIds + '"的数据项？').then(function() {
        return delInbound(inboundIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
	  /** 入库详情序号 */
    rowInboundDetailIndex({ row, rowIndex }) {
      row.orderNum = rowIndex + 1;
    },
    /** 入库详情添加按钮操作 */
    handleAddInboundDetail() {
      let obj = {};
      obj.orderNum = "";
      obj.supplierId = "";
      obj.warehouseId = "";
      obj.materialId = "";
      obj.count = "";
      obj.price = "";
      this.inboundDetailList.push(obj);
    },
    /** 入库详情删除按钮操作 */
    handleDeleteInboundDetail() {
      if (this.checkedInboundDetail.length == 0) {
        this.$modal.msgError("请先选择要删除的入库详情数据");
      } else {
        const inboundDetailList = this.inboundDetailList;
        const checkedInboundDetail = this.checkedInboundDetail;
        this.inboundDetailList = inboundDetailList.filter(function(item) {
          return checkedInboundDetail.indexOf(item.orderNum) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleInboundDetailSelectionChange(selection) {
      this.checkedInboundDetail = selection.map(item => item.orderNum)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/inbound/export', {
        ...this.queryParams
      }, `inbound_${new Date().getTime()}.xlsx`)
    },

  }
};
</script>
