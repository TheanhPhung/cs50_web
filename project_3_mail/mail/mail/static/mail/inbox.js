document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Create alert when send email successfully or error
  function alert(className, message) {
    document.querySelectorAll('#message').forEach(div => {
      div.remove();
    });

    const parent_div = document.querySelector('#messages');
    const div = document.createElement('div');
    div.id = 'message';
    div.className = className;
    div.innerHTML = message;
    div.style.animationPlayState = 'running';
    parent_div.append(div);
  }
  
  // Send email
  function send_email() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Fetch API for sending email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);

      // Alert
      if (result.message) {
        alert("alert alert-success", result.message);
      } else {
        alert("alert alert-warning", result.error);
      } 
    }).catch(error => {
      console.log("Error: ", error);
    });

    load_mailbox("sent");
  }

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // If submit compose form, send email
  document.querySelector('#compose-form').onsubmit = function(event) {
    event.preventDefault();
    send_email();
  } 
}

function load_mailbox(mailbox) {

  function view_email(email) {
    // Get user's email
    const user_email = document.querySelector('#user_email').value;

    const div = document.createElement('div');
    const subdiv = document.createElement('div');
    const div_mail = document.createElement('div');
    const div_subject = document.createElement('div');
    const div_timestamp = document.createElement('div');

    div.className = "container-fluid card mt-2";
    subdiv.className = "row";
    div_mail.className = "col-sm-3 mt-2 mb-2";
    div_subject.className = "col-sm-6 mt-2 mb-2";
    div_timestamp.className = "col-sm-3 mt-2 mb-2 timestamp";

    if (user_email === email.sender) {
      div_mail.innerHTML = email.recipients;
    } else {
      div_mail.innerHTML = email.sender;
    }
    div_subject.innerHTML = email.subject;
    div_timestamp.innerHTML = email.timestamp;

    // Set background for each email based on what if email is read or not
    if (email.read) {
      div.style.background = 'grey';
    } else {
      div.style.background = 'white';
    }

    // Append div tags into the view
    document.querySelector('#emails-view').append(div);
    div.append(subdiv);
    subdiv.append(div_mail);
    subdiv.append(div_subject);
    subdiv.append(div_timestamp);

  }

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  setTimeout(() => {
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      for (email of emails) {
        view_email(email);
      };
    });
  }, 1000);
}

