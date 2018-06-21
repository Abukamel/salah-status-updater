import * as React from "react";

export default class Copyrights extends React.Component<any, any> {
  public render() {
    return (
      <div style={{position: 'absolute', bottom: 0, width: '50%', "marginBottom": "5px"}}>
        <span>
          Icon made by{" "}
          <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">
            Eucalyp
          </a>{" "}
          from{" "}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>{" "}
          is licensed by{" "}
          <a
            href="http://creativecommons.org/licenses/by/3.0/"
            title="Creative Commons BY 3.0"
            target="_blank"
          >
            CC 3.0 BY
          </a>
        </span>
      </div>
    );
  }
}
