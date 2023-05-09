<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="物资类别名称" prop="materialTypeName" label-width="auto">
        <el-input
          v-model="queryParams.materialTypeName"
          placeholder="请输入物资类别名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="显示顺序" prop="orderNum">
        <el-input
          v-model="queryParams.orderNum"
          placeholder="请输入显示顺序"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
	    <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="plus"
          @click="handleAdd"
          v-hasPermi="['bs_server:materialType:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="materialTypeList"
      row-key="materialTypeId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="物资类别名称" prop="materialTypeName" />
      <el-table-column label="物资父节点" align="center" prop="parentId" />
      <el-table-column label="显示顺序" align="center" prop="orderNum" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bs_server:materialType:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['bs_server:materialType:add']"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId!==0"
            type="text"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bs_server:materialType:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改物资分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="物资类别名称" prop="materialTypeName" label-width="100px">
          <el-input v-model="form.materialTypeName" placeholder="请输入物资类别名称" />
        </el-form-item>
        <el-form-item label="物资父节点" prop="parentId" label-width="100px">
          <el-tree-select
              v-model="form.parentId"
              :data="materialTypeOptions"
              :props="{ value: 'materialTypeId', label: 'materialTypeName', children: 'children' }"
              value-key="materialTypeId"
              placeholder="请选择物资父节点"
              check-strictly
          />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum" label-width="100px">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark" label-width="100px">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { listMaterialType, getMaterialType, delMaterialType, addMaterialType, updateMaterialType } from "@/api/bs_server/materialType";

export default {
  name: "MaterialType",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 物资分类表格数据
      materialTypeList: [],
      // 物资分类树选项
      materialTypeOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        materialTypeName: null,
        orderNum: null,
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
    /** 查询物资分类列表 */
    getList() {
      this.loading = true;
      listMaterialType(this.queryParams).then(response => {
        this.materialTypeList = this.handleTree(response.data, "materialTypeId", "parentId");
        this.loading = false;
      });
    },
    /** 转换物资分类数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.materialTypeId,
        label: node.materialTypeName,
        children: node.children
      };
    },
	  /** 查询物资分类下拉树结构 */
    getTreeselect() {
      listMaterialType().then(response => {
        this.materialTypeOptions = [];
        let info = this.handleTree(response.data, "materialTypeId", "parentId");  //树状结构
        //需要先设置根结点ID和根结点名称
        const data = { materialTypeId: info[0].materialTypeId, materialTypeName: info[0].materialTypeName, children: [] };
        data.children = info[0].children;
        this.materialTypeOptions.push(data);
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
        materialTypeId: null,
        materialTypeName: null,
        parentId: null,
        orderNum: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.materialTypeId) {
        this.form.parentId = row.materialTypeId;
      } else {
        this.form.parentId = 10;
      }
      this.open = true;
      this.title = "添加物资分类";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      if (row != null) {
        this.form.parentId = row.materialTypeId;
      }
      getMaterialType(row.materialTypeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改物资分类";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.materialTypeId != null) {
            updateMaterialType(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMaterialType(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除物资分类编号为"' + row.materialTypeId + '"的数据项？').then(function() {
        return delMaterialType(row.materialTypeId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
