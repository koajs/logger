'use strict';

// test tools
const { describe, it, before, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const request = require('supertest');
// test subjects
const chalk = require('chalk');

let log;
let sandbox;
let transporter;
let app;
const transporterFunc = {
  blankFunc(_, __) {
    // blankFunc
  }
};

describe('koa-logger', () => {
  before(() => {
    app = require('./test-server')();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = sandbox.spy(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should log a request', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.text, 'hello world');
    assert.strictEqual(log.called, true);
  });

  it('should log a request with correct method and url', async () => {
    const response = await request(app.callback()).head('/200');

    assert.strictEqual(response.status, 200);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('<--') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s'),
        'HEAD',
        '/200'
      ),
      true
    );
  });

  it('should log a response', async () => {
    const response = await request(app.callback()).get('/200');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(log.callCount, 2);
  });

  it('should log a 200 response', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.green('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/200',
        200,
        sinon.match.any,
        '11b'
      ),
      2
    );
  });

  it('should log a 200 response for stream', async () => {
    const response = await request(app.callback()).get('/200-stream');
    assert.strictEqual(response.status, 200);

    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.green('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/200-stream',
        200,
        sinon.match.any,
        sinon.match.string
      )
    );
  });

  it('should log a 301 response', async () => {
    const response = await request(app.callback()).get('/301');

    assert.strictEqual(response.status, 301);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/301',
        301,
        sinon.match.any,
        sinon.match.string
      )
    );
  });

  it('should log a 304 response', async () => {
    const response = await request(app.callback()).get('/304');

    assert.strictEqual(response.status, 304);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/304',
        304,
        sinon.match.any,
        ''
      ),
      301
    );
  });

  it('should log a 404 response', async () => {
    const response = await request(app.callback()).get('/404');
    assert.strictEqual(response.status, 404);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.yellow('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/404',
        404,
        sinon.match.any,
        '9b'
      ),
      404
    );
  });

  it('should log a 500 response', async () => {
    const response = await request(app.callback()).get('/500');

    assert.strictEqual(response.status, 500);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500',
        500,
        sinon.match.any,
        '12b'
      ),
      500
    );
  });

  it('should log middleware error', async () => {
    const response = await request(app.callback()).get('/error');

    assert.strictEqual(response.status, 500);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/error',
        500,
        sinon.match.any,
        '-'
      )
    );
  });

  it('should log a 500 response with boom', async () => {
    const response = await request(app.callback()).get('/500-boom');

    assert.strictEqual(response.status, 500);
    assert.ok(
      log.calledWith(
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500-boom',
        500,
        sinon.match.any,
        '-'
      )
    );
  });
});

describe('koa-logger-transporter-direct', () => {
  before(() => {
    transporter = function (string, args) {
      transporterFunc.blankFunc(string, args);
    };

    app = require('./test-server')(transporter);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = sandbox.spy(transporterFunc, 'blankFunc');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should log a request', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.text, 'hello world');
    assert.ok(log.called);
  });

  it('should log a request with correct method and url', async () => {
    const response = await request(app.callback()).head('/200');

    assert.strictEqual(response.status, 200);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('<--') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s'),
        'HEAD',
        '/200'
      ]),
      200
    );
  });

  it('should log a response', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(log.callCount, 2);
  });

  it('should log a 200 response', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.green('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/200',
        200,
        sinon.match.any,
        '11b'
      ])
    );
  });

  it('should log a 301 response', async () => {
    const response = await request(app.callback()).get('/301');

    assert.strictEqual(response.status, 301);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/301',
        301,
        sinon.match.any,
        sinon.match.string
      ])
    );
  });

  it('should log a 304 response', async () => {
    const response = await request(app.callback()).get('/304');

    assert.strictEqual(response.status, 304);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/304',
        304,
        sinon.match.any,
        ''
      ])
    );
  });

  it('should log a 404 response', async () => {
    const response = await request(app.callback()).get('/404');
    assert.strictEqual(response.status, 404);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.yellow('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/404',
        404,
        sinon.match.any,
        '9b'
      ])
    );
  });

  it('should log a 500 response', async () => {
    const response = await request(app.callback()).get('/500');

    assert.strictEqual(response.status, 500);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500',
        500,
        sinon.match.any,
        '12b'
      ])
    );
  });

  it('should log middleware error', async () => {
    const response = await request(app.callback()).get('/error');

    assert.strictEqual(response.status, 500);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/error',
        500,
        sinon.match.any,
        '-'
      ])
    );
  });

  it('should log a 500 response with boom', async () => {
    const response = await request(app.callback()).get('/500-boom');

    assert.strictEqual(response.status, 500);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500-boom',
        500,
        sinon.match.any,
        '-'
      ])
    );
  });
});

describe('koa-logger-transporter-opts', () => {
  before(() => {
    transporter = function (string, args) {
      transporterFunc.blankFunc(string, args);
    };

    app = require('./test-server')({ transporter });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = sandbox.spy(transporterFunc, 'blankFunc');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should log a request', async () => {
    const response = await request(app.callback()).get('/200');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.text, 'hello world');

    assert.strictEqual(log.called, true);
  });

  it('should log a request with correct method and url', async () => {
    const response = await request(app.callback()).head('/200');

    assert.strictEqual(response.status, 200);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('<--') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s'),
        'HEAD',
        '/200'
      ])
    );
  });

  it('should log a response', async () => {
    const response = await request(app.callback()).get('/200');
    assert.strictEqual(response.status, 200);

    assert.strictEqual(log.callCount, 2);
  });

  it('should log a 200 response', async () => {
    const response = await request(app.callback()).get('/200');
    assert.strictEqual(response.status, 200);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.green('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/200',
        200,
        sinon.match.any,
        '11b'
      ])
    );
  });

  it('should log a 301 response', async () => {
    const response = await request(app.callback()).get('/301');

    assert.strictEqual(response.status, 301);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/301',
        301,
        sinon.match.any,
        sinon.match.string
      ])
    );
  });

  it('should log a 304 response', async () => {
    const response = await request(app.callback()).get('/304');

    assert.strictEqual(response.status, 304);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.cyan('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/304',
        304,
        sinon.match.any,
        ''
      ])
    );
  });

  it('should log a 404 response', async () => {
    const response = await request(app.callback()).get('/404');

    assert.strictEqual(response.status, 404);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.yellow('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/404',
        404,
        sinon.match.any,
        '9b'
      ])
    );
  });

  it('should log a 500 response', async () => {
    const response = await request(app.callback()).get('/500');

    assert.strictEqual(response.status, 500);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.gray('-->') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500',
        500,
        sinon.match.any,
        '12b'
      ])
    );
  });

  it('should log middleware error', async () => {
    const response = await request(app.callback()).get('/error');

    assert.strictEqual(response.status, 500);
    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/error',
        500,
        sinon.match.any,
        '-'
      ])
    );
  });

  it('should log a 500 response with boom', async () => {
    const response = await request(app.callback()).get('/500-boom');
    assert.strictEqual(response.status, 500);

    assert.ok(
      log.calledWith(sinon.match.string, [
        '  ' +
          chalk.red('xxx') +
          ' ' +
          chalk.bold('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.red('%s') +
          ' ' +
          chalk.gray('%s') +
          ' ' +
          chalk.gray('%s'),
        'GET',
        '/500-boom',
        500,
        sinon.match.any,
        '-'
      ])
    );
  });
});
