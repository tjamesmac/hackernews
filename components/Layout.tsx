import { FunctionComponent } from "preact";

export const Layout: FunctionComponent = ({ children }) => {
  return (
    <div class="py-3 px-3">
      {children}
    </div>
  );
};
