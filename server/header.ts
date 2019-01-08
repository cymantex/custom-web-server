import {Socket} from "net";

export interface Options {
    status?: number,
    statusText?: string,
    protocol?: string
}

export interface Header {
    [key: string]: string | number
}

export const headerEnd = "\r\n\r\n";

export const createResponseHeader = (header: Header = {}, options: Options = {}) => {
    const defaultOptions = {protocol: "HTTP/1.1", status: 200, statusText: "OK"};
    const {status, statusText, protocol} = {...defaultOptions, ...options};
    let headerStart = `${protocol} ${status} ${statusText}`;
    headerStart += Object.keys(header).length > 0 ? "\r\n" : "";
    const headerBody = Object
        .keys(header)
        .map(key => `${key}: ${header[key]}\r\n`);

    return `${headerStart}${headerBody}${headerEnd}`;
};

export const parseRequestHeader = (header: string) => {
    const rawHeaders = header.split("\r\n");
    const [method, url, httpVersion] = rawHeaders.shift().split(" ");
    const headers = rawHeaders
        .filter(header => header)
        .reduce((allHeaders: object, currentHeader: string) => {
            const [key, value] = currentHeader.split(": ");
            return {
                ...allHeaders,
                [key.trim().toLowerCase()]: value.trim()
            };
        }, {});

    return {
        method,
        url,
        httpVersion: httpVersion.split("/")[1],
        headers
    };
};