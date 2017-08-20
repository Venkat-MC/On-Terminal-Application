'use strict';

angular.module('myApp.view1', [])

.controller('ModalInstanceCtrl', ['$scope','$uibModalInstance','items', function ($scope, $modalInstance, items){
  $scope.items = items;

  $scope.cancel = function () {
    $modalInstance.close(false);
  };
}])

.controller('View1Ctrl', ['$scope','$http', 'moment', '$uibModal', '$timeout', function($scope,$http,moment,$uibModal,$timeout) {

  $scope.isDataReady = false;
  $scope.isFileUploaded = false;
  $scope.distinctPorts = [];
  $scope.getUniquePort = function(records) {
    var portArray = [];
    
    for(var k=0; k< $scope.formattedData.length; k++) { 
      portArray.push($scope.formattedData[k].Final_Dischrg_Port_Code);
    }
    console.log(portArray);

    var unique = portArray.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    })
    console.log(unique);
    return unique;
  }
  

  $scope.categorizeRecords = function(records) {
    $scope.categorizeRecords = [];
    $scope.distinctPorts = $scope.getUniquePort(records);
    angular.forEach($scope.distinctPorts, function(key, value){
      $scope.categorizeRecords.push({port: key, records: []});
    });
    for (var i = 0; i< records.length; i++) {
      for(var l=0; l<$scope.distinctPorts.length; l++) {
        if(records[i].Final_Dischrg_Port_Code === $scope.distinctPorts[l]){
          $scope.categorizeRecords[l].records.push(records[i]);
        }
      }     
    }
    console.log($scope.categorizeRecords);
  }

  $scope.portDetails = function (port) {
    console.log("Inside port details");
    console.log(port);
    $scope.blankLFD = [];
    $scope.onLFD = [];
    $scope.pastLFD = [];
    $scope.tomorrowLFD = [];
    $scope.dwo = [];
    $scope.wo = [];
    angular.forEach($scope.categorizeRecords, function (key, value){
      if(key.port === port) {
        angular.forEach(key.records, function(key,value){
          //console.log(key);
          $scope.currentDate = moment(new Date()).format('MM/DD/YYYY');
          if(key.Last_Free_Day === '-') {
            console.log("Blank LFD");
            $scope.blankLFD.push(key);
          }
          else if(moment(new Date(key.Last_Free_Day)).format('MM/DD/YYYY') === $scope.currentDate) {
            console.log("On LFD");
            $scope.onLFD.push(key);
          } else if (moment(new Date(key.Last_Free_Day)).format('MM/DD/YYYY') < $scope.currentDate) {
            console.log("Past LFD");
            $scope.pastLFD.push(key);
          } else {
            console.log("Tom LFD");
            $scope.tomorrowLFD.push(key);
          }

          if(key.WO === ""){
            console.log("WO Empty")
            $scope.dwo.push(key);
          } else {
            if(key.WO_Accept_D_T === '-' && key.Carrier_Name === 'SOUTH CAROLINA STATE PORT AUTH'){
              console.log("WO Not Accepted");
              $scope.wo.push(key);
            }
          }
        })
      }
    })
  }

  $scope.openModal = function (type) {
    $scope.type = type;
    console.log($scope.type);
    var modalInstance = $uibModal.open({
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'view1/modalContent.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      resolve: {
        items: function () {
          console.log(type);
          if (type === 'On LFD'){
            console.log("In LFD");
            console.log($scope.onLFD);
            return $scope.onLFD;
          }else if (type === 'Past LFD'){
            return $scope.pastLFD;
          }else if (type === 'Tomorrow LFD'){
            return $scope.tomorrowLFD;
          }else if (type === 'Blank LFD'){
            return $scope.blankLFD;
          }else if (type === 'DWO'){
            return $scope.dwo;
          }else {
            return $scope.wo;
          }
        }
      }
    });
  }
  
  $scope.readExcel= function (event) {
    $scope.isFileUploaded = true;
    console.log("In Excel Export");  
      var input = event.target;
      var reader = new FileReader();
      reader.onload = function(){
          var fileData = reader.result;
          var wb = XLSX.read(fileData, {type : 'binary'});
  
          wb.SheetNames.forEach(function(sheetName){
          $scope.formattedData =XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
          console.log($scope.formattedData);
          $scope.categorizeRecords($scope.formattedData);
          })
      };
      reader.readAsBinaryString(input.files[0]);
    };
    
  $scope.displayPorts = function () {
    $scope.isDataReady = true;
    console.log($scope.distinctPorts);          
  }

}]);