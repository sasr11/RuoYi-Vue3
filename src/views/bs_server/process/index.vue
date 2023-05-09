<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="流程名称" prop="processName">
        <el-input
          v-model="queryParams.processName"
          placeholder="请输入流程名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建者" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入创建者"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['bs_server:process:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['bs_server:process:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['bs_server:process:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="download"
          @click="handleExport"
          v-hasPermi="['bs_server:process:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格，显示数据 -->
    <el-table v-loading="loading" :data="processList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流程编号" align="center" prop="processId" />
      <el-table-column label="流程名称" align="center" prop="processName" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bs_server:process:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bs_server:process:remove']"
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

    <!-- 添加或修改流程对话框 -->
    <el-dialog :title="title" v-model="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="流程名称" prop="processName">
          <el-input style="width: 350px" v-model="form.processName" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input style="width: 350px" v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <!-- 流程节点详情 -->
        <el-divider content-position="center">流程节点信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="plus"  @click="handleAddProcessNode">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="delete" @click="handleDeleteProcessNode">删除</el-button>
          </el-col>
        </el-row>
        <!-- 流程节点详情数据 -->
        <el-table :data="processNodeList" :row-class-name="rowProcessNodeIndex" @selection-change="handleProcessNodeSelectionChange" ref="processNode">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="审批顺序" align="center" prop="orderNum" width="100"/>
          <el-table-column label="流程节点名称" prop="processNodeName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.processNodeName" placeholder="请输入流程节点名称" />
            </template>
          </el-table-column>
          <el-table-column label="该节点用户" prop="userId" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.userId" placeholder="请选择审批人" clearable>
                <el-option
                    v-for="dict in userList"
                    :key="dict.userId"
                    :label="dict.userName"
                    :value="dict.userId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" width="250">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入备注" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProcess, getProcess, delProcess, addProcess, updateProcess } from "@/api/bs_server/process";
import { listUser} from "@/api/system/user";
import {listSupplier} from "@/api/bs_server/supplier";

export default {
  name: "Process",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedProcessNode: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,

      // 流程表格数据
      processList: [],
      // 流程节点表格数据
      processNodeList: [],
      // 用户列表数据
      userList: [],

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        processName: null,
        createBy: null,
        createTime: null,
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
    /** 查询流程列表 */
    getList() {
      this.loading = true;
      listProcess(this.queryParams).then(response => {
        this.processList = response.rows;
        this.total = response.total;
      });
      this.getListUser();
      this.loading = false;
    },
    getListUser(){
      listUser().then(res =>{
        this.userList = res.rows;
      })
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        processId: null,
        processName: null,
        createBy: null,
        createTime: null,
        remark: null
      };
      this.processNodeList = [];
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
      this.ids = selection.map(item => item.processId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加流程";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const processId = row.processId || this.ids
      getProcess(processId).then(response => {
        this.form = response.data;
        this.processNodeList = response.data.processNodeList;
        this.open = true;
        this.title = "修改流程";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.processNodeList = this.processNodeList;
          if (this.form.processId != null) {
            updateProcess(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProcess(this.form).then(response => {
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
      const processIds = row.processId || this.ids;
      this.$modal.confirm('是否确认删除流程编号为"' + processIds + '"的数据项？').then(function() {
        return delProcess(processIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
	/** 流程节点序号 */
    rowProcessNodeIndex({ row, rowIndex }) {
      row.orderNum = rowIndex + 1;
    },
    /** 流程节点添加按钮操作 */
    handleAddProcessNode() {
      let obj = {};
      obj.orderNum = "";
      obj.processNodeName = "";
      obj.userId = "";
      obj.orderNum = "";
      obj.remark = "";
      this.processNodeList.push(obj);
    },
    /** 流程节点删除按钮操作 */
    handleDeleteProcessNode() {
      if (this.checkedProcessNode.length == 0) {
        this.$modal.msgError("请先选择要删除的流程节点数据");
      } else {
        const processNodeList = this.processNodeList;
        const checkedProcessNode = this.checkedProcessNode;
        this.processNodeList = processNodeList.filter(function(item) {
          return checkedProcessNode.indexOf(item.orderNum) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleProcessNodeSelectionChange(selection) {
      this.checkedProcessNode = selection.map(item => item.orderNum)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bs_server/process/export', {
        ...this.queryParams
      }, `process_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
