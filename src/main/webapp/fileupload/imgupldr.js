(function ($, undefined) {

  var ImageUploader = function (jq, cfg) {
    /**
     * 默认的配置
     */
    var config = {
      uploadPath: 'img/upload',
      delPath: 'img/del',
      maxSize: 4,
      savePath: null,
      preview: true
    };
    if (typeof cfg == 'object') {
      $.extend(config, cfg);
    }
    var self = this;
    self.cfg = config;
    self.el = jq;
    self.form;
    self.input;
    self.selectBtn = jq.find('.upldr-select');
    self._files = [];
    self.sbmtDel = [];
    self.init();
  };

  var toast = window.sd ? sd.toast : alert, cfm = (window.sd) ? sd.confirm : function (msg, cb) {
    if (confirm(msg) && $.isFunction(cb)) {
      cb();
    }
  };

  var fn = ImageUploader.prototype = {constructor: ImageUploader};

  var hsInited = false;

  fn.init = function () {
    var self = this;
    this.selectBtn.on('click', function () {
      if(self._sizeExceed())
        return;
      self._createForm();
      return self.input.click();
    });
    if (!self.el.ajaxSubmit) {
      $.error('此插件依赖jQuery Form！');
      return;
    }
    if (self.cfg.preview && !hsInited) {
      if (!window.hs) {
        $.error('预览依赖highslide插件！');
        return;
      }
      hs.align = 'center';
      hs.transitions = ['expand', 'crossfade'];
      hs.fadeInOut = true;
      hs.dimmingOpacity = 0.8;
      hs.outlineType = 'rounded-white';
      hs.captionEval = 'this.thumb.alt';
      hs.marginBottom = 105; // make room for the thumbstrip and the controls
      hs.numberPosition = 'caption';
      hs.addSlideshow({
        interval: 5000,
        repeat: false,
        useControls: true,
        overlayOptions: {
          className: 'text-controls',
          position: 'bottom center',
          relativeTo: 'viewport',
          offsetY: -60
        },
        thumbstrip: {
          position: 'bottom center',
          mode: 'horizontal',
          relativeTo: 'viewport'
        }
      });
      hsInited = true;
    }
  };

  fn.addImage = function () {
    var self = this;
    if (!self.input.val())
      return;
    if (!self.cfg.savePath) {
      $.error('请指定文件保存路径');
    }
    if(self._sizeExceed())
      return;
    var file = new UploadFile(self);
    self._files.push(file);
    file.upload();
  };

  fn._createForm = function () {
    var self = this;
    if (self.form || self.form instanceof jQuery) return;
    var $add = self.el.find('.upldr-add'),
      $form = self.form = $('<form style="display: none;" method="post" action="' + self.cfg.uploadPath + '" enctype="multipart/form-data">'
        + '<input name="file" accept="image/gif,image/jpeg,image/png" type="file"/>'
        + '<input name="savePath" value="' + self.cfg.savePath + '">'
        + '</form>');
    var $input = self.input = $form.find('input[type=file]');
    $form.appendTo($add);
    $input.on('change', function () {
      self.addImage();
    });
    $form.on('submit', function () {
      return false;
    });
  };

  fn._removeForm = function () {
    var self = this;
    self.input && self.input.remove();
    self.form && self.form.remove();
    self.form = undefined;
    self.input = undefined;
  };

  fn._sizeExceed = function () {
    var self = this;
    if(self.cfg.maxSize && self.cfg.maxSize <= self._files.length){
      toast('已超出了长度限制！');
      return true;
    }
    return false;
  };

  /**
   * 加载图片
   * @param img 图片名称
   * @param path
   */
  fn.showImage = function (img, path) {
    var self = this, addImage = function (img) {
      path = path || self.cfg.savePath;
      var file = new UploadFile(self);
      file.changeImage(img);
      file.load = true;
      self._files.push(file);
    };
    if ($.isArray(img)) {
      for (var i in img) {
        if(self._sizeExceed())
          return;
        addImage(img[i]);
      }
    } else if (typeof img == 'string') {
      if(self._sizeExceed())
        return;
      addImage(img);
    }
  };

  /**
   * 获取现有图片的名称
   * @returns {Array}
   */
  fn.names = function () {
    var self = this, files = self._files, rtn = [];
    self._removeForm();
    for (var i in files) {
      rtn.push(files[i].name);
    }
    return rtn;
  };

  /**
   * 获取提交时要删除的图片
   */
  fn.submitDel = function () {
    return this.sbmtDel;
  };

  fn.removeImage = function (uploadFile,msg) {
    var self = this, files = self._files;
    for (var i in files) {
      if (uploadFile && uploadFile == files[i]) {
        if(uploadFile.load){
          //已经上传了的
          self.sbmtDel.push(uploadFile.name);
          files.splice(i, 1);
        }else {
          $.ajax({
            url: self.cfg.delPath,
            data: {
              subPath: self.cfg.savePath + '/' + uploadFile.name
            },
            success: function (dat) {
              window.sd && sd.dealError(dat);
              if (dat.state) {
                files.splice(i, 1);
                if(msg  === false)
                  return;
                toast('删除成功');
              } else {
                toast('删除失败');
              }
            }
          });
        }
      }
    }
  };

  /**
   * 上传的文件对象
   * @param cfg
   * @constructor
   */
  var UploadFile = function (upldr) {
    var self = this;
    self.upldr = upldr;
    self.name = '';
    self.update = true;
    self.load = false;
    self.$img;
    self.el;
    self.init();
  };

  UploadFile.prototype = {
    constructor: UploadFile,
    init: function () {
      var self = this, upldr = self.upldr, $el = upldr.el, $add = $el.find('.upldr-add'), $item = self.el = $('<div class="upldr-item"></div>'),
        $close = $('<a class="upldr-close" href="javascript:void(0);"><img src="img/img-colse.png"/></a>'),
        $img = $('<a href="javascript:void(0);" class="upldr-img"><img src="img/loading.gif" ></a>');
      $close.appendTo($item);
      $img.appendTo($item);
      $close.on('click', function () {
        cfm('是否要删除此图片', function () {
          self.remove();
        });
      });
      this.$img = $img;
      if (upldr.cfg.preview) {
        $img.attr('onclick', 'return hs.expand(this)');
      }
      $item.insertBefore($add);
    },
    upload: function () {
      var self = this, upldr = self.upldr, $img = self.$img;
      upldr._createForm();
      upldr.form.ajaxSubmit({
        type: 'post',
        success: function (dat) {
          var res = JSON.parse(dat);
          if (res.state) {
            self.changeImage(res.data.name);
          } else {
            toast('上传失败');
            self.remove(false);
          }
          upldr._removeForm();
        }
      });
    },
    changeImage: function (name, preview) {
      var self = this, $img = self.$img, upldr = self.upldr;
      preview = preview || upldr.cfg.preview;
      if (!name) {
        $.error('请指定名字');
        return;
      }
      self.name = name;
      var savePath = upldr.cfg.savePath, path = 'file/' + savePath + '/' + name;
      if (!savePath) {
        $.error('请指定文件保存路径');
      }
      $img.html('<img src="' + path + '"' + (preview ? 'title="点击查看大图"' : '') + '/>');
      if (preview) {
        $img.attr('href', path);
      } else {
        $img.attr('href', 'javascript:void(0)');
      }
    },
    remove: function (msg) {
      var self = this;
      self.el.remove();
      self.upldr.removeImage(self,msg);
    }
  };

  /**
   * jQuery 图片上传/预览插件
   * 依赖:jquery form 和 high slide
   * 初始化配置：
   *  uploadPath: 'img/upload', 上传文件 url
   *  delPath: 'img/del', 删除文件 url
   *  savePath: null, 对应枚举中的 subDirectory
   *  preview: true 图片是否可以预览
   *  可用方法
   *   names() 所有图片的名称
   *   showImage(arr(string 或者 array)) 加载图片
   *   submitDel() 获取提交时需要删除的图片　（如果图片时通过加载（showImage）则在提交时才能被删除）
   * @param opt
   * @param parm
   * @returns {jQuery}
   */
  $.fn.imgupldr = function (opt, parm) {
    var upldr = this, rtn = this, plugin = $(this).data("_imgupldr");
    if (!plugin) {
      plugin = new ImageUploader(this, opt);
      $(this).data("_imgupldr", plugin);
    }
    if (typeof opt === 'string' && typeof plugin[opt] === 'function') {
      rtn = plugin[opt](parm);
    }
    return rtn || upldr;
  };

})(jQuery);