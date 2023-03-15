<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="申请者" prop="createBy" label-width="auto">
        <el-input
            v-model="queryParams.createBy"
            placeholder="请输入操作者名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请时间">
        <el-date-picker
            v-model="daterangeCreateTime"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="出库者" prop="updateBy" label-width="auto">
        <el-input
            v-model="queryParams.updateBy"
            placeholder="请输入更新者名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出库时间">
        <el-date-picker
            v-model="daterangeUpdateTime"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
        <el-button icon="refresh"  @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="plus"
            @click="handleAdd"
            v-hasPermi="['bs_server:outbound:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="download"
            @click="handleExport"
            v-hasPermi="['bs_server:outbound:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格，显示数据 -->
    <el-table
        v-loading="loading"
        :data="outboundList"
        @selection-change="handleSelectionChange"
        show-summary
        :summary-method="summaryMethod1"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="出库编号" align="center" prop="outboundId" />
      <el-table-column label="申请人" align="center" prop="createBy" />
      <el-table-column label="出库总价" align="center" prop="totalPrice" />
      <el-table-column label="状态" align="center" prop="status"
                       filter-placement="bottom-end"
                       :filters="[
                            { text: '待出库', value: '3' },
                            { text: '已出库', value: '4' },
                        ]"
                       :filter-method="filterStatus"
                       >
        <template #default="scope">
          <dict-tag :options="bs_outbound" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime"/>
      <el-table-column label="出库人" align="center" prop="updateBy" />
      <el-table-column label="出库时间" align="center" prop="updateTime"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              v-if="scope.row.status === '3'"
              type="text"
              icon="edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['bs_server:outbound:edit']"
          >出库</el-button>
          <el-button
              v-if="scope.row.status === '4'"
              type="text"
              icon="edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['bs_server:outbound:edit']"
          >查看</el-button>
          <el-button
              v-if="role_ === 'admin'"
              type="text"
              icon="delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['bs_server:outbound:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 查看数据对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form :inline="true" ref="form" :model="form" :rules="rules" label-width="100px" disabled>
        <el-form-item label="出库编号：" prop="outboundId">
          <div style="width: 250px">{{form.outboundId}}</div>
        </el-form-item>
        <el-form-item label="申请人：" prop="userId">
          <div style="width: 250px">{{form.createBy}}</div>
        </el-form-item>
        <el-form-item label="出库总价：" prop="totalPrice">
          <div style="width: 250px">{{form.totalPrice}}</div>
        </el-form-item>
        <el-form-item label="出库人：" prop="user2Id">
          <div style="width: 250px">{{form.updateBy}}</div>
        </el-form-item>
        <el-form-item label="流程名称：" prop="processId">
          <div style="width: 250px">{{form.processName}}</div>
        </el-form-item>
        <!-- 出库详情 -->
        <el-divider content-position="center">出库详情信息</el-divider>
        <!-- 出库详情表数据 -->
        <el-table
            :data="outboundDetailList"
            ref="outboundDetail"
            height="250"
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import store from "@/store";
import {useDict} from "@/utils/dict";
import {addOutbound, delOutbound, getOutbound, listOutbound, updateOutbound} from "@/api/bs_server/outbound";

export default {
  name: "operation",
  data() {
    return {
      // 当前用户名称
      userName_: store.state.value.user.name,
      // 当前用户角色
      role_: store.state.value.user.roles[0],
      // 字典数据
      bs_outbound: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedOutboundDetail: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,

      // 出库表格数据
      outboundList: [],
      // 出库详情表格数据
      outboundDetailList: [],
      // 客户列表数据
      clientList: [],
      // 仓库列表数据
      warehouseList: [],
      // 物资编号数据
      materialList: [],
      // 流程数据
      processList: [],

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 单价时间范围
      daterangeCreateTime: [],
      // 单价时间范围
      daterangeUpdateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        createBy: null,
        status: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
    this.bs_outbound = useDict("bs_outbound")["bs_outbound"];  //获取字典数据
  },
  methods: {
    /** 查询出库列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangeCreateTime && '' !== this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      }
      if (null != this.daterangeUpdateTime && '' !== this.daterangeUpdateTime) {
        this.queryParams.params["beginUpdateTime"] = this.daterangeUpdateTime[0];
        this.queryParams.params["endUpdateTime"] = this.daterangeUpdateTime[1];
      }
      listOutbound(this.queryParams).then(response => {
        this.outboundList = []
        this.handleData(response.rows);
        this.total = response.total;
      });
      this.loading = false;
    },
    handleData(dataList){
      dataList.forEach((item)=>{
        if(item.status ==='3' || item.status ==='4') this.outboundList.push(item);
      })
    },
    /** 筛选状态 */
    filterStatus(value, row){
      return row.status === value;
    },
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        outboundId: null,
        userId: null,
        status: null,
        createTime: null,
        user2Id: null,
        updateTime: null
      };
      this.outboundDetailList = [];
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
      this.ids = selection.map(item => item.outboundId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加出库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const outboundId = row.outboundId || this.ids
      getOutbound(outboundId).then(response => {
        this.form = response.data;
        this.outboundDetailList = response.data.outboundDetailList;
        this.open = true;
        this.title = "出库操作";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.status = '4';
          if (this.form.outboundId != null) {
            updateOutbound(this.form).then(response => {
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
      const outboundIds = row.outboundId || this.ids;
      this.$modal.confirm('是否确认删除出库编号为"' + outboundIds + '"的数据项？').then(function() {
        return delOutbound(outboundIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 出库详情序号 */
    rowOutboundDetailIndex({ row, rowIndex }) {
      row.orderNum = rowIndex + 1;
    },
    /** 出库详情添加按钮操作 */
    handleAddOutboundDetail() {
      let obj = {};
      obj.orderNum = "";
      obj.clientId = "";
      obj.warehouseId = "";
      obj.materialId = "";
      obj.count = "";
      obj.price = "";
      this.outboundDetailList.push(obj);
    },
    /** 出库详情删除按钮操作 */
    handleDeleteOutboundDetail() {
      if (this.checkedOutboundDetail.length == 0) {
        this.$modal.msgError("请先选择要删除的出库详情数据");
      } else {
        const outboundDetailList = this.outboundDetailList;
        const checkedOutboundDetail = this.checkedOutboundDetail;
        this.outboundDetailList = outboundDetailList.filter(function(item) {
          return checkedOutboundDetail.indexOf(item.orderNum) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleOutboundDetailSelectionChange(selection) {
      this.checkedOutboundDetail = selection.map(item => item.orderNum)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/outbound/export', {
        ...this.queryParams
      }, `outbound_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
