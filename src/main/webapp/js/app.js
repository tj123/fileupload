

(function(){

  angular.module('app',['file.uploader'])



  angular.module('app').controller('HeheCtl',function ($scope) {




    $scope.submit = function () {

      console.log($scope.d);

    }



  })





})();
