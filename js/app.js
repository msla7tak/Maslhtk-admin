$(document).ready(function () {

    /*********************************************************
     ******* View Logic (show/remove rows in table) **********
     *********************************************************/

    // add new lat to table
    var tableShowMessage = function (key, values) {
        var table = $('#table-location');
        var created = (values.created ? moment(values.created).format('YYYY-MM-DD, HH:mm:ss') : '<em>no info</em>');
        var edited = (values.edited ? moment(values.edited).format('YYYY-MM-DD, HH:mm:ss') : '<em>not yet</em>');
        var newEntry = '<tr id="' + key + '"><td class="long">' + values.long + '</td><td class="lat">' + values.lat + '</td>' +
            '<td class="created">' + created +
            '<td class="table-col-action"><div class="btn-group">' +
            '<button class="btn btn-secondary button-edit">edit</button><button class="btn btn-secondary button-delete">delete</button>' +
            '</div></td></tr>';
        table.html(table.html() + newEntry);
    };

    // show lat modification in table
    var tableModifyMessage = function (key, values) {
        $('#' + key + ' .long').text(values.long);
        $('#' + key + ' .lat').text(values.lat);
    };


    /*******************************************************
     ***** Firebase DB Logic (listen for changes) **********
     *******************************************************/

    // listen for new location
    firebase.database().ref('location').on('child_added', function (snapshot) {
        tableShowMessage(snapshot.key, snapshot.val());
    });

    // listen for modified location
    firebase.database().ref('location').on('child_changed', function (snapshot) {
        tableModifyMessage(snapshot.key, snapshot.val());
    });



    /********************************************************
     ****** Form Logic (add / remove location) **************
     ********************************************************/

    // add new lat
    $('#form-add').submit(function (event) {
        var long = $('#form-add-long');
        var lat = $('#form-add-lat');
        var button = $('#form-add-save');
        if (long.val().length === 0 || lat.val().length === 0) {
            alert('Please enter a long and a lat.');
            return false;
        }
        button.prop('disabled', true);
        // save new entry to database
        var newMessageKey = firebase.database().ref().child('location').push({
            long: long.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            lat: lat.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            created: firebase.database.ServerValue.TIMESTAMP
        }, function (error) {
            if (error) {
                alert('The lat could not be saved!');
            } else {
                long.val('');
                lat.val('');
                button.prop('disabled', false);
                $('#modal-add-lat').modal('hide');
            }
        });
        return false;
    });

    // edit lat
    $('#form-edit').submit(function (event) {
        var long = $('#form-edit-long');
        var lat = $('#form-edit-lat');
        var key = $('#form-edit-key').val();
        var button = $('#form-edit-save');
        if (long.val().length === 0 || lat.val().length === 0) {
            alert('Please enter a long and a lat.');
            return false;
        }
        button.prop('disabled', true);
        // save changes to database
        var newMessageKey = firebase.database().ref().child('location/' + key).set({
            long: long.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            lat: lat.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            edited: firebase.database.ServerValue.TIMESTAMP
        }, function (error) {
            if (error) {
                alert('The lat could not be saved!');
            } else {
                long.val('');
                lat.val('');
                button.prop('disabled', false);
                $('#modal-edit-lat').modal('hide');
            }
        });
        return false;
    });

    // close add modal (abort)
    $('#form-add-abort').click(function () {
        $('#modal-add-lat').modal('hide');
    });

    // close edit modal (abort)
    $('#form-edit-abort').click(function () {
        $('#modal-edit-lat').modal('hide');
    });

    // button "edit" for lat
    $(document).on('click', '.button-edit', function (event) {
        var key = this.parentNode.parentNode.parentNode.id;
        $('#form-edit-key').val(key);
        $('#form-edit-long').val($('#' + key + ' .long').text());
        $('#form-edit-lat').val($('#' + key + ' .lat').text());
        $('#modal-edit-lat').modal('show');
    });

    // button "delete" for lat
    $(document).on('click', '.button-delete', function (event) {
        if (window.confirm('Are you sure you want to delete the lat?')) {
            var key = this.parentNode.parentNode.parentNode.id;
            firebase.database().ref().child('location/' + key).remove();
        }
    });
});