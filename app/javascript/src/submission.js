import SubmissionStatusView from './submission_status_view';
import TimeoutTimer from './timeout_timer';

class Submission {
  constructor(element) {
    this.element = element;
    this.timer = new TimeoutTimer(30, () => { this.setStatus('timeout'); });
    this.initialHtml = element.html();
  }

  update(params) {
    this.html = params.html;

    this.setStatus(params.opsStatus);
  }

  setStatus(status) {
    this.timer.reset();

    switch(status) {
      case 'queueing': { this.queueing(); break; }
      case 'queued': { this.queued(); break; }
      case 'cancelling': { this.cancelling(); break; }
      case 'cancelled': { this.cancelled(); break; }
      case 'tested': { this.tested(); break; }
      case 'timeout': { this.timeout(); break; }
      case 'resubmitted': { this.resubmitted(); break; }
    }

    this.render();

    this.status = status;

    this.onChange(this.status);
  }

  render() {
    this.element.html(this.html);

    if (this.onRender) { this.onRender(); }
  }

  queueing() {
    this.timer.start();

    this.html = new SubmissionStatusView('queueing').render();
    this.onRender = function() {
      this.element.find('.js-cancel-submission').click(() => {this.setStatus('cancelling') });
      $('body').keydown((e) => {
        if(e.key === 'Escape') { this.setStatus('cancelling'); }
      });
    }
  }

  queued() {
    this.timer.start();

    this.onRender = function() {
      this.element.find('.js-cancel-submission').click(() => {this.setStatus('cancelling') });
      $('body').keydown((e) => {
        if(e.key === 'Escape') { this.setStatus('cancelling'); }
      });
    }
  }

  cancelled() {
    this.html = this.initialHtml;
  }

  timeout() {
    this.html = new SubmissionStatusView('timeout').render();

    this.onRender = function() {
      this.element.find('.js-submit-code').click(() => { this.setStatus('resubmitted') });
    }
  }

  tested() {
    this.onRender = function() {
      this.element.removeClass('test-result-focus');

      this.element[0].scrollIntoView({
        behavior: "smooth",
        block: "end"
      });

      this.element.addClass('test-result-focus');
    }
  }

  cancelling() {
    if (this.status !== 'queueing' && this.status !== 'queued') { return; }

    const previousStatus = this.status
    const previousHtml = this.html

    this.html = new SubmissionStatusView('cancelling').render();
    this.onRender = function() {
      this.element.find('.js-submission-cancel-confirm').focus();
      this.element.find('.js-submission-cancel-confirm').click(() => {
        this.setStatus('cancelled');
      });
      this.element.find('.js-submission-cancel-refuse').click(() => {
        this.html = previousHtml;
        this.setStatus(previousStatus);
      });
    }
  }

  resubmitted() {
  }
}

export default Submission;
