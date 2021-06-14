function ajax(method, url, queryObject, timeout=5000) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');  
        xhr.onloadend = () => {
            if(xhr.status > 399) {
                if(xhr.status === 418) {
                    reject(JSON.parse(xhr.response).logInfo);
                } else {
                    reject(`${xhr.status} ${xhr.statusText}`);
                }
                console.error(xhr); 
            } else {
                resolve(xhr.response); // JSON object
            }
        }
        xhr.timeout = timeout;
        xhr.ontimeout = () => {
            console.error(xhr);
            reject(`невдала спроба запиту на сервер (перевищено таймаут).`);
        };
        xhr.onerror = () => {
            console.error(xhr)
            reject('невдала спроба запиту на сервер!')
        }
        xhr.send(JSON.stringify(queryObject));
    });
}

function qs(path) {
    return document.querySelector(path);
}

function elid(id) {
    return document.getElementById(id);
}

function satt(element, attrName, attrValue='') {
    element.setAttribute(attrName, attrValue);
}

function sattid(id, attrName, attrValue='') {
    elid(id).setAttribute(attrName, attrValue);
}

function toggleClass(id, ...rest) {
    elid(id).classList.toggle(...rest);
}

function toggleClassQS(selector, ...rest) {
    qs(selector).classList.toggle(...rest);
}

function hide(id) {
    elid(id).classList.toggle('hidden', true);
}

function unhide(id) {
    elid(id).classList.toggle('hidden', false);
}

function hideQS(selector) {
    qs(selector).classList.toggle('hidden', true);
}

function unhideQS(selector) {
    qs(selector).classList.toggle('hidden', false);
}

function listener (qsPath, ...rest) {
    qs(qsPath).addEventListener(...rest);
}

function gatt(el, att) {
    return el.getAttribute(att);
}

function gattid(id, att) {
    return elid(id).getAttribute(att);
}

function getParentNode(element, level=1) {
    while(level-- > 0) {
        element = element.parentNode;
        if(!element) {
            return null;
        }
    }
    return element;
}

function isChildOf(element, supposedParentWithinBody) {
    while(element !== document.body) {
        element = element.parentNode;
        if(element === supposedParentWithinBody) {
            return true;
        }
    }
    return false;
}

function showXhrError (innerText, parentQSpath) {
    const result = document.createElement('p');
    satt(result, 'style', `color:red`);
    result.innerHTML = innerText;
    qs(parentQSpath).appendChild(result);
    setTimeout(() => qs(parentQSpath).removeChild(result), 5000);
}

function trimDates(obj, ...keys) {
    keys.forEach(key => {
        if(obj[key]) {
            obj[key] = obj[key].slice(0,10);
        }
    });
}