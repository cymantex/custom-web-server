import {expect} from "chai";
import {createResponseHeader, parseRequestHeader, headerEnd} from "../header";

describe("createResponseHeader", () => {
    const defaultHeaderStart = "HTTP/1.1 200 OK";

    it("Should return default protocol, status and statusText", () => {
        expect(createResponseHeader()).to.be.equal(`${defaultHeaderStart}${headerEnd}`);
    });

    it("Should prefer custom protocol, status and statusText", () => {
        expect(createResponseHeader({}, {
            protocol: "foo",
            status: 0,
            statusText: "bar"
        })).to.be.equal(`foo 0 bar${headerEnd}`);
    });

    it("Should add key value pairs correctly", () => {
        expect(createResponseHeader({
            "foo": "bar"
        })).to.be.equal(
            `${defaultHeaderStart}\r\n` +
            `foo: bar\r\n` +
            `${headerEnd}`
        );
    });
});

describe("parseRequestHeader", () => {
    it("Should parse request correctly.", () => {
        expect(parseRequestHeader(
            "GET /foo/bar HTTP/1.1\r\n" +
            "Host: localhost:3000\r\n" +
            "foo: bar\r\n" +
            headerEnd
        )).to.deep.equal({
            method: "GET",
            url: "/foo/bar",
            httpVersion: "1.1",
            headers: {
                host: "localhost:3000",
                foo: "bar"
            }
        });
    });
});