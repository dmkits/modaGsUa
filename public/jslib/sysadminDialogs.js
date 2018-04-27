/**
 * Created by dmkits on 30.12.16.
 */
define(["dojox/widget/DialogSimple", "dijit/ConfirmDialog", "dijit/form/Button", "dojo/keys", "dojo/on", "dijit/registry", "dojo/domReady!"],
    function (DialogSimple, ConfirmDialog, Button, keys, on, registry) {
        return {
            noServerConnectDialog: function(){
                var noServerConnectDialog = registry.byId('noServerConnectDialog');
                if(noServerConnectDialog) return noServerConnectDialog.show();
                 noServerConnectDialog = new DialogSimple({ id:"noServerConnectDialog",
                    style:"text-align:center", title:"FAIL", content: "No connection to the server!<br>", closable:true });
                var okButton = new Button({label:"OK"});
                okButton.onClick=function(){
                    noServerConnectDialog.onCancel();
                };
                noServerConnectDialog.addChild(okButton);
                noServerConnectDialog.startup();
                return noServerConnectDialog.show();
            },
            /**
             * IANAGEZ 2017-09-07
             * @param params
             * params = {ConfirmDialog params}
             */
            makeDialog: function (id, params) {
                var myDialog = new ConfirmDialog({id:id});
                for (var paramName in params) {
                    myDialog.set(paramName, params[paramName]);
                }
                myDialog.on("keypress", function (event) {
                    if (event.keyCode == keys.ENTER) {
                        myDialog.onExecute();
                    }
                });
                myDialog.startup();
                return myDialog;
            },
            /**
             * params = {}
             * resultCallback = function(result = { result=true/false } )
             */
            showAdminAuthDialog: function (params, resultCallback) {
                var adminAuthDialog = registry.byId('adminAuthDialog');
                if (adminAuthDialog) {
                    if (resultCallback) {
                        adminAuthDialog.onExecute = function () {
                            this.hide();
                            var result = {result: true};
                            //result.adminName = inputForName.value;
                            //result.adminPassword = inputForPswd.value;
                            result.adminName= document.getElementById('auth_dialog_admin_name').value;
                            result.adminPassword =document.getElementById('auth_dialog_admin_password').value;
                            resultCallback(result);
                        };
                    } else {
                        adminAuthDialog.onExecute = function () {
                            this.hide();
                        }
                    }
                    return adminAuthDialog.show();
                }
                var table = document.createElement('table');
                var trForName = document.createElement('tr');
                var trForPswd = document.createElement('tr');
                table.appendChild(trForName);
                table.appendChild(trForPswd);
                var tdNameLabel = document.createElement('td');
                var tdNameInput = document.createElement('td');
                var labelForName = document.createElement('label');
                labelForName.htmlFor = 'auth_dialog_admin_name';
                labelForName.innerText = "Name:";
                var inputForName = document.createElement('input');
                inputForName.setAttribute('id', 'auth_dialog_admin_name');
                inputForName.setAttribute('type', 'text');

                tdNameLabel.appendChild(labelForName);
                tdNameInput.appendChild(inputForName);

                trForName.appendChild(tdNameLabel);
                trForName.appendChild(tdNameInput);

                var tdPswdLabel = document.createElement('td');
                var tdPswdInput = document.createElement('td');
                var labelForPswd = document.createElement('label');
                labelForPswd.htmlFor = 'auth_dialog_admin_password';
                labelForPswd.innerText = "Password:";
                var inputForPswd = document.createElement('input');
                inputForPswd.setAttribute('id', 'auth_dialog_admin_password');
                inputForPswd.setAttribute('type', 'password');
                tdPswdLabel.appendChild(labelForPswd);
                tdPswdInput.appendChild(inputForPswd);
                trForPswd.appendChild(tdPswdLabel);
                trForPswd.appendChild(tdPswdInput);

                adminAuthDialog = this.makeDialog("adminAuthDialog",
                    { autofocus: false, content: table, title: "Admin authorisation", buttonOk: "Login", buttonCancel: "Cancel" });
                adminAuthDialog.onShow = function () {
                    document.getElementById('auth_dialog_admin_name').value = 'root';
                    document.getElementById('auth_dialog_admin_password').value = '';
                    inputForPswd.focus();
                };

                if (resultCallback) {
                    adminAuthDialog.onExecute = function () {
                        this.hide();
                        var result = {result: true};
                        result.adminName = inputForName.value;
                        result.adminPassword = inputForPswd.value;
                        resultCallback(result);
                    };
                }
                return adminAuthDialog.show();
            },
            /**
             *
             * @param params {onlyDataBackup:true/false}
             * @param resultCallback
             * @returns {*}
             */
            showBackupDialog: function (params, resultCallback) {
                var backupDialog = registry.byId('backupDialog');
                if (backupDialog) {
                    if (resultCallback) {
                        backupDialog.onExecute = function () {
                            this.hide();
                            var result = {result: true};
                            result.backup_fileName = document.getElementById('backup_fileName_in_backup_dialog').value;
                            resultCallback(result);
                        };
                    }else{
                        backupDialog.onExecute = function () {
                            this.hide();
                        }
                    }
                    return backupDialog.show();
                }

                var table = document.createElement('table');
                var tr = document.createElement('tr');
                var tdForLabel = document.createElement('td');
                var tdForInput = document.createElement('td');
                var label = document.createElement('label');
                label.htmlFor = 'backup_fileName_in_backup_dialog';
                label.innerText = "file name:";
                var inputBackupFileName = document.createElement('input');
                inputBackupFileName.setAttribute("id", "backup_fileName_in_backup_dialog");
                var td = document.createElement('td');
                td.innerText = ".sql";
                table.appendChild(tr);
                tr.appendChild(tdForLabel);
                tr.appendChild(tdForInput);
                tr.appendChild(td);
                tdForLabel.appendChild(label);
                tdForInput.appendChild(inputBackupFileName);

                backupDialog = this.makeDialog("backupDialog",
                    { content: table, title: "Save backup", buttonOk: "Save", buttonCancel: "Cancel" });
                backupDialog.onShow = function () {
                    var DBName = document.getElementById('db.name').value;
                    var now = moment().format("YYYYMMDD_HHm");
                    var defaultFileName = DBName + "_" + now;
                    if (params.onlyDataBackup == "true")defaultFileName = defaultFileName + "_data";
                    document.getElementById('backup_fileName_in_backup_dialog').value = defaultFileName;
                };
                if (resultCallback) {
                    backupDialog.onExecute = function () {
                        this.hide();
                        var result = {result: true};
                        result.backup_fileName = document.getElementById('backup_fileName_in_backup_dialog').value;
                        resultCallback(result);
                    };
                }
                return backupDialog.show();
            },
            /**
             * @param resultCallback
             * @returns {}
             */
            showRewriteBackupDialog: function (resultCallback) {
                var rewriteBackupDialog = registry.byId('rewriteBackupDialog');
                if (rewriteBackupDialog) {
                    if (resultCallback) {
                        rewriteBackupDialog.onExecute = function () {
                            this.hide();
                            var result = {rewrite: true};
                            resultCallback(result);
                        };
                    }else{
                        rewriteBackupDialog.onExecute = function () {
                            this.hide();
                        }
                    }
                    return rewriteBackupDialog.show();
                }
                rewriteBackupDialog = this.makeDialog("rewriteBackupDialog",
                    { content: "File exists!\n Rewrite file?", title: "Rewrite file",
                        buttonOk: "Rewrite", buttonCancel: "Cancel" });
                if (resultCallback) {
                    rewriteBackupDialog.onExecute = function () {
                        this.hide();
                        var result = {rewrite: true};
                        resultCallback(result);
                    };
                }
                return rewriteBackupDialog.show();
            },

            showRestoreDialog: function (resultCallback) {
                var restoreDialog = registry.byId('restoreDialog');
                if (restoreDialog) {
                    if (resultCallback) {
                        restoreDialog.onExecute = function () {
                            this.hide();
                            var result = {result: true};
                            result.restore_fileName = document.getElementById('restore_fileName_in_restore_dialog').value;
                            resultCallback(result);
                        }
                    }else{
                            restoreDialog.onExecute = function () {
                                this.hide();
                            }
                        }
                    return restoreDialog.show();
                }
                var table = document.createElement('table');
                var tr = document.createElement('tr');
                var tdForLabel = document.createElement('td');
                var tdForInput = document.createElement('td');
                var label = document.createElement('label');
                label.htmlFor = 'restore_fileName_in_restore_dialog';
                label.innerText = "file name:";
                var inputRestoreFileName = document.createElement('input');
                inputRestoreFileName.setAttribute("id", "restore_fileName_in_restore_dialog");
                var td = document.createElement('td');
                td.innerText = ".sql";
                table.appendChild(tr);
                tr.appendChild(tdForLabel);
                tr.appendChild(tdForInput);
                tr.appendChild(td);
                tdForLabel.appendChild(label);
                tdForInput.appendChild(inputRestoreFileName);

                restoreDialog = this.makeDialog("restoreDialog",
                    { content: table, title: "Restore from file",
                         buttonOk: "Restore", buttonCancel: "Cancel" });
                if (resultCallback) {
                    restoreDialog.onExecute = function () {
                        this.hide();
                        var result = {result: true};
                        result.restore_fileName = document.getElementById('restore_fileName_in_restore_dialog').value;
                        resultCallback(result);
                    };
                }
                return restoreDialog.show();
            },

            showDbListForUserDialog: function (resultCallback) {
                var dbListForUserDialog = registry.byId('dbForUserDialog');
                if (dbListForUserDialog){
                    if (resultCallback) {
                        dbListForUserDialog.onExecute = function () {
                            this.hide();
                            var result = {result: true};
                            result.db_user_name = document.getElementById('server_db_user_password').value;
                            result.db_user_password = document.getElementById('auth_dialog_admin_password').value;
                            resultCallback(result);
                        };
                    }else{
                        dbListForUserDialog.onExecute = function () {
                            this.hide();
                        }
                    }
                    return dbListForUserDialog.show();
                }
                var table = document.createElement('table');
                var trForName = document.createElement('tr');
                var trForPswd = document.createElement('tr');
                table.appendChild(trForName);
                table.appendChild(trForPswd);
                var tdNameLabel = document.createElement('td');
                var tdNameInput = document.createElement('td');
                var labelForName = document.createElement('label');
                labelForName.htmlFor = 'auth_dialog_admin_name';
                labelForName.innerText = "Name:";
                var inputForName = document.createElement('input');
                inputForName.setAttribute('id', 'server_db_user_password');
                inputForName.setAttribute('type', 'text');

                tdNameLabel.appendChild(labelForName);
                tdNameInput.appendChild(inputForName);

                trForName.appendChild(tdNameLabel);
                trForName.appendChild(tdNameInput);

                var tdPswdLabel = document.createElement('td');
                var tdPswdInput = document.createElement('td');
                var labelForPswd = document.createElement('label');
                labelForPswd.htmlFor = 'auth_dialog_admin_password';
                labelForPswd.innerText = "Password:";
                var inputForPswd = document.createElement('input');
                inputForPswd.setAttribute('id', 'server_db_user_password');
                inputForPswd.setAttribute('type', 'password');
                tdPswdLabel.appendChild(labelForPswd);
                tdPswdInput.appendChild(inputForPswd);
                trForPswd.appendChild(tdPswdLabel);
                trForPswd.appendChild(tdPswdInput);

                var dbListForUserDialog = this.makeDialog("dbForUserDialog",
                    { autofocus: false, content: table, title: "Please, enter user name",
                         buttonOk: "Get list", buttonCancel: "Cancel" });
                if (resultCallback) {
                    dbListForUserDialog.onExecute = function () {
                        this.hide();
                        var result = {result: true};
                        //result.db_user_name = inputForName.value;
                        //result.db_user_password = inputForPswd.value;
                        result.db_user_name = document.getElementById('server_db_user_password').value;
                        result.db_user_password = document.getElementById('auth_dialog_admin_password').value;
                        resultCallback(result);
                    };
                }
                dbListForUserDialog.onShow = function () {
                    inputForName.setAttribute('value', '');
                    inputForPswd.setAttribute('value', '');
                    inputForName.focus();
                };
                return dbListForUserDialog.show();
            }
        }
    });