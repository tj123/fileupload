(function (angular,undefined) {

  angular.module('file.uploader', [])

    .directive('fileUploader', ['$timeout', function ($timeout) {


      return {
        restrict: 'A',
        scope: true,
        link: function (scope, ele, attr) {


          var option = {
            $add: '$add',
            url: 'upload',
            accept:undefined,
          };


          var $form = angular.element('<form method="post" enctype="multipart/form-data" action="' +
            option.url + '" style="display: none;"></form>');
          var $input = angular.element('<input name="file" type="file" style="display: none;"/>');


          scope[option.$add] = function () {
            $input.click();
          };

          $input.on('change',function () {
            $form.ajaxSubmit({
              type:'post',
              success:function (dat) {
                var d = JSON.parse(dat);
                console.log(d);

              }
            });
          });
          $form.submit(function () {
            return false;
          });
          $input.appendTo($form);
          $form.appendTo(ele);


        }

      };

    }]);


})(angular);

