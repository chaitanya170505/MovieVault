document.getElementById('edit-button').onclick = function(event) {
    event.preventDefault(); 
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('edit-profile-section').classList.remove('hidden');
};

document.getElementById('cancel-edit').onclick = function() {
    document.getElementById('edit-profile-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
};